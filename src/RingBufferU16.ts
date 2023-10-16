import RingBufferBase from "./RingBufferBase";

export default class RingBufferU16 extends RingBufferBase<Uint16Array> {
  public constructor(frameSize: number) {
    super({ frameSize, TypedArrayConstructor: Uint16Array });
  }
}
