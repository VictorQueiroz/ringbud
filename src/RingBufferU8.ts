import RingBufferBase from "./RingBufferBase";

export default class RingBufferU8 extends RingBufferBase<Uint8Array> {
  public constructor(frameSize: number) {
    super({ frameSize, TypedArrayConstructor: Uint8Array });
  }
}
