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
  frameCacheSize: number;
}

export interface IRingBufferOptions<T extends TypedArray>
  extends Partial<IRingBufferOptionalOptions> {
  frameSize: number;
  TypedArrayConstructor: ITypedArrayConstructor<T>;
}

export default class RingBufferBase<T extends TypedArray> {
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
   * As long as you read the buffer, at least as long as the frameCacheSize.
   *
   * @default 0 No triming will be done unless this option is set toover.
   */
  public frameCacheSize;
  readonly #TypedArrayConstructor;
  readonly #frameSize;
  #arrayBuffer;
  #readOffset;
  #writeOffset;
  public constructor({
    frameSize,
    frameCacheSize = 0,
    TypedArrayConstructor,
  }: IRingBufferOptions<T>) {
    if (!frameSize) {
      throw new Error("frameSize must be greater than 0");
    }
    this.#readOffset = 0;
    this.#writeOffset = 0;
    this.#TypedArrayConstructor = TypedArrayConstructor;
    this.frameCacheSize = frameCacheSize;
    this.#frameSize = frameSize;
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
  public remainingFrames() {
    return this.#remainingFrames();
  }
  public drain() {
    return this.#read(this.#remainingSamples());
  }
  public read(): T | null {
    return this.#read(this.#frameSize);
  }
  /**
   * @returns the number of samples that can be read
   */
  #remainingSamples() {
    return this.#writeOffset - this.#readOffset;
  }
  #remainingFrames() {
    return this.#remainingSamples() / this.#frameSize;
  }
  /**
   * @returns true if frameCacheSize is set and the buffer has reached the limit (frameCacheSize)
   */
  #full() {
    if (this.frameCacheSize > 0) {
      return this.#remainingFrames() >= this.frameCacheSize;
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
    return this.#frameSize * this.#TypedArrayConstructor.BYTES_PER_ELEMENT * 2;
  }
}
