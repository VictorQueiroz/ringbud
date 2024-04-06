import { IRingBufferSubclassOptions } from ".";
import RingBufferBase from "./RingBufferBase";

export default class RingBufferF32 extends RingBufferBase<Float32Array> {
  public constructor(
    frameSize: number,
    options: IRingBufferSubclassOptions = {},
  ) {
    super({ ...options, frameSize, TypedArrayConstructor: Float32Array });
  }
}
