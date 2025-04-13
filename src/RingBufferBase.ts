import validateNumber from "./validateNumber";

export type TypedArray =
  | Float32Array
  | Int16Array
  | Int32Array
  | Uint8Array
  | Uint16Array
  | Uint32Array
  | Uint8ClampedArray;

export interface ITypedArrayConstructor<T extends TypedArray> {
  readonly BYTES_PER_ELEMENT: number;
  new (buffer: ArrayBuffer): T;
}

export interface IRingBufferOptionalOptions {
  /**
   * The number of frames to preallocate in the ring buffer.
   *
   * This option will be used whenever the buffer needs to be reallocated or when it is
   * allocated for the first time. And the value passed to this option will be used to
   * determine part of the size of the new buffer.
   *
   * For example, if you create a ring buffer with frame size of 10, and `preallocateFrameCount`
   * is set to 100, the buffer will be allocated with:
   *
   * ```ts
   * // Given
   * const frameSize = 10;
   * const preallocateFrameCount = 100;
   * const frameSampleCountInBytes = TypedArrayConstructor.BYTES_PER_ELEMENT;
   * // The buffer will be initially allocated with
   * (frameSize * frameSampleCountInBytes) * preallocateFrameCount
   * ```
   *
   * @default 10
   */
  preallocateFrameCount: number;
  /**
   * The offset which to start triming the buffer by dropping what has been read
   * and start writing from the beginning of the buffer.
   *
   * If greater than zero, it will represent the number of frames (1 frame = BYTES_PER_ELEMENT * frameSize)
   * that will be kept in the buffer before we start triming.
   *
   * ### How it works
   *
   * The trimming will be done after a reading operations. Which means you can still
   * expand the buffer infinitely if you write more than you read.
   *
   * ### After a reading operation
   *
   * Whenever the buffer is read, the remaining bytes after the reading
   * will be written to the beginning of the buffer to avoid storing the information
   * in-memory, thus, avoiding resizing the buffer when newer data is written.
   *
   * The downside of this option is that we copy the buffer every time we read it, but this
   * allows the ring buffer to deal with very large buffers without resizing the memory.
   * As long as you read the buffer, at least as long as the `frameCacheSize`.
   *
   * @default 0 No triming will be done unless this option is set to over 0.
   */
  frameCacheSize: number;
}

export interface IRingBufferOptions<T extends TypedArray>
  extends Partial<IRingBufferOptionalOptions> {
  frameSize: number;
  TypedArrayConstructor: ITypedArrayConstructor<T>;
}

/**
 * The maximum value that a 32-bit unsigned integer can have
 */
const MAX_UINT32 = 0o37777777777;

export default class RingBufferBase<T extends TypedArray> {
  readonly #TypedArrayConstructor;
  readonly #preallocateFrameCount;
  readonly #frameCacheSize;
  readonly #frameSize;
  #arrayBuffer;
  #readOffset;
  #writeOffset;
  public constructor({
    frameSize,
    frameCacheSize = 0,
    preallocateFrameCount = 10,
    TypedArrayConstructor,
  }: IRingBufferOptions<T>) {
    this.#frameSize = validateNumber({
      value: frameSize,
      name: "Frame Size",
      validations: {
        min: 1,
        integer: true,
        max: MAX_UINT32,
      },
    });
    this.#preallocateFrameCount = validateNumber({
      value: preallocateFrameCount,
      name: "Preallocate Frame Count",
      validations: {
        min: 1,
        integer: true,
        max: MAX_UINT32,
      },
    });
    this.#frameCacheSize = validateNumber({
      value: frameCacheSize,
      name: "Frame Cache Size",
      validations: {
        min: 0,
        integer: false,
        max: MAX_UINT32,
      },
    });
    this.#readOffset = 0;
    this.#writeOffset = 0;
    this.#TypedArrayConstructor = TypedArrayConstructor;
    this.#arrayBuffer = new ArrayBuffer(this.#initialSize());
  }
  /**
   * Returns true if there are no frames to be read
   * @returns true if there are no frames to be read
   */
  public empty() {
    return this.#remainingSamples() < this.#frameSize;
  }
  /**
   * The returned buffer does not ignore the read samples. It returns the entire record
   * of the written samples.
   *
   * The returned buffer is not a copy, so any changes made to it will be reflected in the
   * ring buffer.
   * @returns Reference buffer with the currently written frames
   */
  public peek() {
    return this.#view();
  }
  #view() {
    return new this.#TypedArrayConstructor(this.#arrayBuffer);
  }
  public write(value: T) {
    this.#maybeReallocate(value.length);
    this.#view().set(value, this.#writeOffset);
    this.#writeOffset += value.length;
  }
  /**
   * This method returns specifically frames that can be read, so,
   * incomplete frames will not be considered.
   *
   * For instance, if the ring buffer have frame size of 100 samples,
   * and you have 101 samples written, this method will return 1.
   *
   * @returns the number of frames that can be read
   */
  public remainingFrames() {
    /**
     * Here we floor the division to avoid returning the count of incomplete frames.
     */
    return Math.floor(this.#writtenFrameCount());
  }
  public drain() {
    return this.#read(this.#remainingSamples());
  }
  public read(): T | null {
    return this.#read(this.#frameSize);
  }
  /**
   * This method simply divide the samples available for reading by the
   * frame size. So it can contain non-integer values. For precise frame count
   * use the `remainingFrames` method.
   * @returns the number of frames that were written so far
   */
  #writtenFrameCount() {
    return this.#remainingSamples() / this.#frameSize;
  }
  /**
   * @returns the number of samples that can be read
   */
  #remainingSamples() {
    return this.#writeOffset - this.#readOffset;
  }
  /**
   * @returns true if frameCacheSize is set and the buffer has reached the limit (frameCacheSize)
   */
  #full() {
    if (this.#frameCacheSize > 0) {
      return this.#writtenFrameCount() >= this.#frameCacheSize;
    }
    return false;
  }
  #read(sampleCount: number): T | null {
    if (!sampleCount) {
      return null;
    }
    const remainingBytes = this.#remainingSamples();
    if (remainingBytes >= sampleCount) {
      let view = this.#view().subarray(
        this.#readOffset,
        this.#readOffset + sampleCount,
      ) as T;
      this.#readOffset += sampleCount;
      if (this.#readOffset >= this.#writeOffset) {
        this.#writeOffset = 0;
        this.#readOffset = 0;
      }
      if (this.#full()) {
        const drained = this.drain();
        if (drained) {
          view = view.slice(0) as T;
          this.write(drained);
        }
      }
      return view;
    }
    return null;
  }
  #maybeReallocate(samples: number) {
    const sampleCountInBytes =
      samples * this.#TypedArrayConstructor.BYTES_PER_ELEMENT;
    if (this.#view().length - this.#writeOffset <= samples) {
      const oldArrayBuffer = this.#arrayBuffer;
      this.#arrayBuffer = new ArrayBuffer(
        oldArrayBuffer.byteLength + sampleCountInBytes + this.#initialSize(),
      );
      this.#view().set(new this.#TypedArrayConstructor(oldArrayBuffer));
    }
  }
  #initialSize() {
    const bytesPerFrame =
      this.#frameSize * this.#TypedArrayConstructor.BYTES_PER_ELEMENT;
    return bytesPerFrame * this.#preallocateFrameCount;
  }

  [Symbol.iterator]() {
    return this[Symbol.asyncIterator]();
  }

  *[Symbol.asyncIterator]() {
    let frame: T | null;
    do {
      frame = this.read();
      if (frame !== null) {
        yield frame;
      }
    } while (frame !== null);
  }
}
