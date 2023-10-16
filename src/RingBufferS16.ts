import RingBufferBase from "./RingBufferBase";

export default class RingBufferS16 extends RingBufferBase<Int16Array> {
  public constructor(frameSize: number) {
    super({ frameSize, TypedArrayConstructor: Int16Array });
  }
}
