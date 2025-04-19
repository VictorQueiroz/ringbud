import RingBufferBase from "./RingBufferBase";
import { IRingBufferSubclassOptions } from "./types";

export default class RingBufferS16 extends RingBufferBase<Int16Array> {
  public constructor(
    frameSize: number,
    options: IRingBufferSubclassOptions = {}
  ) {
    super({
      ...options,
      frameSize,
      TypedArrayConstructor: Int16Array
    });
  }

  override get [Symbol.toStringTag]() {
    return "RingBufferS16";
  }
}
