import RingBufferBase from "./RingBufferBase";
import { IRingBufferSubclassOptions } from "./types";

export default class RingBufferU16 extends RingBufferBase<Uint16Array> {
  public constructor(
    frameSize: number,
    options: IRingBufferSubclassOptions = {}
  ) {
    super({
      ...options,
      frameSize,
      TypedArrayConstructor: Uint16Array
    });
  }

  override get [Symbol.toStringTag]() {
    return "RingBufferU16";
  }
}
