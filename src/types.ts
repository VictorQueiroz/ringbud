import {
  IRingBufferOptions,
  TypedArray
} from "./RingBufferBase";

/**
 * This interface is created to be used when creating `RingBufferBase` subclasses.
 */
export interface IRingBufferSubclassOptions
  extends Omit<
    IRingBufferOptions<TypedArray>,
    "TypedArrayConstructor" | "frameSize"
  > {}
