import test from "ava";
import {
  RingBufferBase,
  RingBufferF32,
  RingBufferU16,
  RingBufferU8,
} from "../src";

test("it should return true for the empty method if there is not enough data to form a frame", (t) => {
  const rb = new RingBufferU8(100);
  t.true(rb.empty());

  rb.write(new Uint8Array(50).fill(1));
  t.true(rb.empty());
});

test("Uint16Array: it should return false, after the ring buffer started to havve enough data to form a frame", (t) => {
  const rb = new RingBufferU16(100);
  t.true(rb.empty());

  rb.write(new Uint16Array(50).fill(1));
  t.true(rb.empty());

  rb.write(new Uint16Array(50).fill(1));
  t.false(rb.empty());

  t.deepEqual(rb.read(), new Uint16Array(100).fill(1));
  t.true(rb.empty());
});

test("Float32Array: it should return false, after the ring buffer started to havve enough data to form a frame", (t) => {
  const rb = new RingBufferF32(100);
  t.true(rb.empty());

  rb.write(new Float32Array(50).fill(1));
  t.true(rb.empty());

  rb.write(new Float32Array(50).fill(1));
  t.false(rb.empty());

  t.deepEqual(rb.read(), new Float32Array(100).fill(1));
  t.true(rb.empty());
});

test("Uint8Array: it should return false, after the ring buffer started to havve enough data to form a frame", (t) => {
  const rb = new RingBufferU8(100);
  t.true(rb.empty());

  rb.write(new Uint8Array(50).fill(1));
  t.true(rb.empty());

  rb.write(new Uint8Array(50).fill(1));
  t.false(rb.empty());

  t.deepEqual(rb.read(), new Uint8Array(100).fill(1));
  t.true(rb.empty());
});

test("it should trim the buffer to avoid resizing memory", (t) => {
  const rb = new RingBufferU8(100, {
    frameCacheSize: 1,
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
    rb.peek().subarray(0, 200),
    new Uint8Array([
      ...new Uint8Array(100).fill(2),
      ...new Uint8Array(100).fill(3),
    ]),
  );
});

test("it should not trim, if trim option is disabled the buffer to avoid resizing memory", (t) => {
  const rb = new RingBufferBase({
    frameSize: 100,
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

test("it should only keep a certain amount of frames in memory", (t) => {
  const rb = new RingBufferBase({
    frameSize: 100,
    frameCacheSize: 2,
    TypedArrayConstructor: Uint8Array,
  });
  rb.write(
    new Uint8Array([
      ...new Uint8Array(100).fill(1),
      ...new Uint8Array(100).fill(2),
    ]),
  );
  t.deepEqual(rb.read(), new Uint8Array(100).fill(1));
  t.deepEqual(rb.read(), new Uint8Array(100).fill(2));
  rb.write(new Uint8Array(100).fill(3));
  t.deepEqual(rb.read(), new Uint8Array(100).fill(3));
  t.deepEqual(rb.read(), null);
});

test("it should return the remaining frames", (t) => {
  const rb = new RingBufferBase({
    frameSize: 100,
    TypedArrayConstructor: Uint8Array,
  });
  rb.write(
    new Uint8Array([...new Array(100).fill(1), ...new Array(100).fill(2)]),
  );
  t.is(rb.remainingFrames(), 2);
  rb.read();
  t.is(rb.remainingFrames(), 1);
  rb.read();
  t.is(rb.remainingFrames(), 0);
});

test("it should not accept a frame size that is less than one", (t) => {
  t.throws(
    () => {
      new RingBufferBase({
        frameSize: 0,
        TypedArrayConstructor: Uint8Array,
      });
      return 1;
    },
    {
      instanceOf: Error,
      // message: /It must be an integer\.$/,
      message: [
        '"0" is not a valid value for Frame Size. It failed to following validations:\n',
        "\t- It must be at least 1.",
      ].join(""),
    },
  );
});

test("it should not accept floating point frame size", (t) => {
  t.throws(
    () => {
      new RingBufferBase({
        frameSize: 1.5,
        TypedArrayConstructor: Uint8Array,
      });
    },
    {
      instanceOf: Error,
      message: [
        '"1.5" is not a valid value for Frame Size. It failed to following validations:\n',
        "\t- It must be an integer.",
      ].join(""),
    },
  );
});

test("it should not return the count for incomplete frames", (t) => {
  const rb = new RingBufferBase({
    frameSize: 8,
    TypedArrayConstructor: Uint8Array,
  });
  rb.write(new Uint8Array(4).fill(1));
  t.is(rb.remainingFrames(), 0);
  rb.write(new Uint8Array(4).fill(1));
  t.is(rb.remainingFrames(), 1);
  rb.write(new Uint8Array(4).fill(1));
  t.is(rb.remainingFrames(), 1);
  rb.write(new Uint8Array(4).fill(1));
  t.is(rb.remainingFrames(), 2);
  rb.write(new Uint8Array(4).fill(1));
  t.is(rb.remainingFrames(), 2);
});

test("it should throw an error if preallocate frame count is not greater than zero", (t) => {
  t.throws(
    () => {
      new RingBufferBase({
        frameSize: 8,
        preallocateFrameCount: 0,
        TypedArrayConstructor: Uint8Array,
      });
    },
    {
      instanceOf: Error,
      message: [
        '"0" is not a valid value for Preallocate Frame Count. It failed to following validations:\n',
        "\t- It must be at least 1.",
      ].join(""),
    },
  );
});

test("it should only return full frames", (t) => {
  const rb = new RingBufferBase({
    frameSize: 100,
    TypedArrayConstructor: Uint8Array,
  });
  rb.write(
    new Uint8Array([...new Array(100).fill(1), ...new Array(100).fill(2)]),
  );
  t.is(rb.remainingFrames(), 2);
  rb.read();
  t.is(rb.remainingFrames(), 1);
  rb.read();
  t.is(rb.remainingFrames(), 0);
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

test('it should iterate over the ring buffer using standard `Symbol.asyncIterator`', async (t) => {
  const rb = new RingBufferU8(100);
  rb.write(
    new Uint8Array([
      ...new Uint8Array(100).fill(1),
      ...new Uint8Array(100).fill(2),
      ...new Uint8Array(100).fill(3),
      ...new Uint8Array(100).fill(4),
      ...new Uint8Array(100).fill(5),
    ]),
  );
  let count = 0;
  for await (const frame of rb) {
    t.deepEqual(frame, new Uint8Array(100).fill(count + 1));
    count++;
  }
  t.is(count, 5);
});

test('it should iterate over the ring buffer using standard `Symbol.iterator`', (t) => {
  const rb = new RingBufferU8(100);
  rb.write(
    new Uint8Array([
      ...new Uint8Array(100).fill(1),
      ...new Uint8Array(100).fill(2),
      ...new Uint8Array(100).fill(3),
      ...new Uint8Array(100).fill(4),
      ...new Uint8Array(100).fill(5),
    ]),
  );
  let count = 0;
  for (const frame of rb) {
    t.deepEqual(frame, new Uint8Array(100).fill(count + 1));
    count++;
  }
  t.is(count, 5);
});
