import { IRingBufferSubclassOptions } from ".";
import RingBufferBase from "./RingBufferBase";

export default class RingBufferS16 extends RingBufferBase<Int16Array> {
  public constructor(
    frameSize: number,
    options: IRingBufferSubclassOptions = {},
  ) {
    super({ ...options, frameSize, TypedArrayConstructor: Int16Array });
  }
}
