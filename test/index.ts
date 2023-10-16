import test from "ava";
import { RingBufferBase, RingBufferU8 } from "../src";

test("it should clamp the buffer to avoid resizing memory", (t) => {
  const rb = new RingBufferU8(100);
  rb.write(
    new Uint8Array([
      ...new Uint8Array(100).fill(1),
      ...new Uint8Array(100).fill(2),
      ...new Uint8Array(100).fill(3),
    ]),
  );
  t.deepEqual(rb.read(), new Uint8Array(100).fill(1));

  t.deepEqual(
    rb.peek().subarray(0, 200),
    new Uint8Array([
      ...new Uint8Array(100).fill(2),
      ...new Uint8Array(100).fill(3),
    ]),
  );
});

test("it should not clamp, if clamp option is disabled the buffer to avoid resizing memory", (t) => {
  const rb = new RingBufferBase({
    frameSize: 100,
    clamp: false,
    TypedArrayConstructor: Uint8Array,
  });
  rb.write(
    new Uint8Array([
      ...new Uint8Array(100).fill(1),
      ...new Uint8Array(100).fill(2),
      ...new Uint8Array(100).fill(3),
    ]),
  );
  t.deepEqual(rb.read(), new Uint8Array(100).fill(1));

  t.deepEqual(
    rb.peek().subarray(0, 300),
    new Uint8Array([
      ...new Uint8Array(100).fill(1),
      ...new Uint8Array(100).fill(2),
      ...new Uint8Array(100).fill(3),
    ]),
  );
});

test("it should read always preserving frame sequence", (t) => {
  const rb = new RingBufferU8(100);
  rb.write(
    new Uint8Array([
      ...new Uint8Array(100).fill(1),
      ...new Uint8Array(100).fill(2),
      ...new Uint8Array(100).fill(3),
      ...new Uint8Array(100).fill(4),
    ]),
  );
  t.deepEqual(rb.read(), new Uint8Array(100).fill(1));
  t.deepEqual(rb.read(), new Uint8Array(100).fill(2));
  t.deepEqual(rb.read(), new Uint8Array(100).fill(3));
  t.deepEqual(rb.read(), new Uint8Array(100).fill(4));
  t.deepEqual(rb.read(), null);
});

test("it should drain the ring buffer", (t) => {
  const rb = new RingBufferU8(100);
  rb.write(
    new Uint8Array([
      ...new Uint8Array(100).fill(1),
      ...new Uint8Array(100).fill(2),
      ...new Uint8Array(100).fill(3),
      ...new Uint8Array(100).fill(4),
      ...new Uint8Array(40).fill(5),
    ]),
  );
  t.deepEqual(rb.read(), new Uint8Array(100).fill(1));
  t.deepEqual(rb.read(), new Uint8Array(100).fill(2));
  t.deepEqual(rb.read(), new Uint8Array(100).fill(3));
  t.deepEqual(rb.read(), new Uint8Array(100).fill(4));
  t.deepEqual(rb.read(), null);
  t.deepEqual(rb.read(), null);
  t.deepEqual(rb.drain(), new Uint8Array(40).fill(5));
});
