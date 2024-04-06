import { IRingBufferSubclassOptions } from "./types";
import RingBufferBase from "./RingBufferBase";

export default class RingBufferU16 extends RingBufferBase<Uint16Array> {
  public constructor(
    frameSize: number,
    options: IRingBufferSubclassOptions = {},
  ) {
    super({ ...options, frameSize, TypedArrayConstructor: Uint16Array });
  }
}
