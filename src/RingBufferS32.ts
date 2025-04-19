import RingBufferBase from "./RingBufferBase";
import { IRingBufferSubclassOptions } from "./types";

export default class RingBufferS32 extends RingBufferBase<Int32Array> {
  public constructor(
    frameSize: number,
    options: IRingBufferSubclassOptions = {}
  ) {
    super({
      ...options,
      frameSize,
      TypedArrayConstructor: Int32Array
    });
  }

  override get [Symbol.toStringTag]() {
    return "RingBufferS32";
  }
}
