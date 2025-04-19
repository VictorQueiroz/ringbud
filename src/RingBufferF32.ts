import RingBufferBase from "./RingBufferBase";
import { IRingBufferSubclassOptions } from "./types";

export default class RingBufferF32 extends RingBufferBase<Float32Array> {
  public constructor(
    frameSize: number,
    options: IRingBufferSubclassOptions = {}
  ) {
    super({
      ...options,
      frameSize,
      TypedArrayConstructor: Float32Array
    });
  }

  override get [Symbol.toStringTag]() {
    return "RingBufferF32";
  }
}
