import RingBufferBase from "./RingBufferBase";
import { IRingBufferSubclassOptions } from "./types";

export default class RingBufferU8 extends RingBufferBase<Uint8Array> {
  public constructor(
    frameSize: number,
    options: IRingBufferSubclassOptions = {}
  ) {
    super({
      ...options,
      frameSize,
      TypedArrayConstructor: Uint8Array
    });
  }

  override get [Symbol.toStringTag]() {
    return "RingBufferU8";
  }
}
