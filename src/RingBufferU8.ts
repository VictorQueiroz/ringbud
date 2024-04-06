import { IRingBufferSubclassOptions } from ".";
import RingBufferBase from "./RingBufferBase";

export default class RingBufferU8 extends RingBufferBase<Uint8Array> {
  public constructor(
    frameSize: number,
    options: IRingBufferSubclassOptions = {},
  ) {
    super({ ...options, frameSize, TypedArrayConstructor: Uint8Array });
  }
}
