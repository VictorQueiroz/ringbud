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

export interface IRingBufferOptions<T extends TypedArray> {
  frameSize: number;
  /**
   * If enabled, whenever the buffer is read, the remaining bytes after the reading
   * will be written to the beginning of the buffer to avoid storing the information
   * in-memory, thus, avoiding resizing the buffer when newer data is written.
   *
   * the downside of this option is that we copy the buffer every time we read it, but this
   * allows the ring buffer to deal with very large buffers without resizing the memory.
   */
  clamp?: boolean;
  TypedArrayConstructor: ITypedArrayConstructor<T>;
}

export default class RingBufferBase<T extends TypedArray> {
  readonly #TypedArrayConstructor;
  readonly #frameSize;
  readonly #clamp;
  #arrayBuffer;
  #readOffset;
  #writeOffset;
  public constructor({
    frameSize,
    clamp = true,
    TypedArrayConstructor,
  }: IRingBufferOptions<T>) {
    this.#readOffset = 0;
    this.#writeOffset = 0;
    this.#TypedArrayConstructor = TypedArrayConstructor;
    this.#clamp = clamp;
    this.#frameSize = frameSize;
    this.#arrayBuffer = new ArrayBuffer(this.#initialSize());
  }
  peek() {
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
  public drain() {
    return this.#read(this.#writeOffset - this.#readOffset);
  }
  public read(): T | null {
    return this.#read(this.#frameSize);
  }
  #read(sampleCount: number): T | null {
    if (!sampleCount) {
      return null;
    }
    const remainingBytes = this.#writeOffset - this.#readOffset;
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
      if (this.#clamp) {
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
