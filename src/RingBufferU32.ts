import RingBufferBase from "./RingBufferBase";
import { IRingBufferSubclassOptions } from "./types";

export default class RingBufferU32 extends RingBufferBase<Uint32Array> {
  public constructor(
    frameSize: number,
    options: IRingBufferSubclassOptions = {}
  ) {
    super({
      ...options,
      frameSize,
      TypedArrayConstructor: Uint32Array
    });
  }

  override get [Symbol.toStringTag]() {
    return "RingBufferU32";
  }
}
