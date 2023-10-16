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

export default class RingBufferBase<T extends TypedArray> {
  readonly #TypedArrayConstructor;
  readonly #frameSize;
  #arrayBuffer;
  #readOffset;
  #writeOffset;
  public constructor(
    frameSize: number,
    TypedArrayConstructor: ITypedArrayConstructor<T>,
  ) {
    this.#readOffset = 0;
    this.#writeOffset = 0;
    this.#TypedArrayConstructor = TypedArrayConstructor;
    this.#arrayBuffer = new ArrayBuffer(this.#initialSize());
    this.#frameSize = frameSize;
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
      const view = this.#view().subarray(
        this.#readOffset,
        this.#readOffset + sampleCount,
      ) as T;
      this.#readOffset += sampleCount;
      if (this.#readOffset >= this.#writeOffset) {
        this.#writeOffset = 0;
        this.#readOffset = 0;
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
