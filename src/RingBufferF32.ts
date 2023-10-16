import RingBufferBase from "./RingBufferBase";

export default class RingBufferF32 extends RingBufferBase<Float32Array> {
  public constructor(frameSize: number) {
    super({
      frameSize,
      TypedArrayConstructor: Float32Array,
    });
  }
}
