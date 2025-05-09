import assert from "assert";
import test from "ava";
import {
  RingBufferBase,
  RingBufferException,
  RingBufferF32,
  RingBufferS16,
  RingBufferS32,
  RingBufferU16,
  RingBufferU32,
  RingBufferU8
} from "../src";

test("it should return true for the empty method if there is not enough data to form a frame", (t) => {
  const rb = new RingBufferU8(100);
  t.true(rb.empty());

  rb.write(new Uint8Array(50).fill(1));
  t.true(rb.empty());
});

test("Uint16Array: it should return false, after the ring buffer started to have enough data to form a frame", (t) => {
  const rb = new RingBufferU16(100);
  t.true(rb.empty());

  rb.write(new Uint16Array(50).fill(1));
  t.true(rb.empty());

  rb.write(new Uint16Array(50).fill(1));
  t.false(rb.empty());

  t.deepEqual(rb.read(), new Uint16Array(100).fill(1));
  t.true(rb.empty());
});

test("Float32Array: it should return false, after the ring buffer started to have enough data to form a frame", (t) => {
  const rb = new RingBufferF32(100);
  t.true(rb.empty());

  rb.write(new Float32Array(50).fill(1));
  t.true(rb.empty());

  rb.write(new Float32Array(50).fill(1));
  t.false(rb.empty());

  t.deepEqual(rb.read(), new Float32Array(100).fill(1));
  t.true(rb.empty());
});

test("Uint8Array: it should return false, after the ring buffer started to have enough data to form a frame", (t) => {
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
    frameCacheSize: 1
  });
  rb.write(
    new Uint8Array([
      ...new Uint8Array(100).fill(1),
      ...new Uint8Array(100).fill(2),
      ...new Uint8Array(100).fill(3)
    ])
  );
  t.deepEqual(rb.read(), new Uint8Array(100).fill(1));

  t.deepEqual(
    rb.peek().subarray(0, 200),
    new Uint8Array([
      ...new Uint8Array(100).fill(2),
      ...new Uint8Array(100).fill(3)
    ])
  );
});

test("it should not trim, if trim option is disabled the buffer to avoid resizing memory", (t) => {
  const rb = new RingBufferBase({
    frameSize: 100,
    TypedArrayConstructor: Uint8Array
  });
  rb.write(
    new Uint8Array([
      ...new Uint8Array(100).fill(1),
      ...new Uint8Array(100).fill(2),
      ...new Uint8Array(100).fill(3)
    ])
  );
  t.deepEqual(rb.read(), new Uint8Array(100).fill(1));

  t.deepEqual(
    rb.peek().subarray(0, 300),
    new Uint8Array([
      ...new Uint8Array(100).fill(1),
      ...new Uint8Array(100).fill(2),
      ...new Uint8Array(100).fill(3)
    ])
  );
});

test("it should only keep a certain amount of frames in memory", (t) => {
  const rb = new RingBufferBase({
    frameSize: 100,
    frameCacheSize: 2,
    TypedArrayConstructor: Uint8Array
  });
  rb.write(
    new Uint8Array([
      ...new Uint8Array(100).fill(1),
      ...new Uint8Array(100).fill(2)
    ])
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
    TypedArrayConstructor: Uint8Array
  });
  rb.write(
    new Uint8Array([
      ...new Array(100).fill(1),
      ...new Array(100).fill(2)
    ])
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
        TypedArrayConstructor: Uint8Array
      });
      return 1;
    },
    {
      instanceOf: Error,
      message: [
        '"0" is not a valid value for Frame Size. It failed to following validations:\n',
        "\t- It must be at least 1."
      ].join("")
    }
  );
});

test("it should throw `RingBufferException` in case the frame size is less than one", (t) => {
  t.throws(
    () => {
      new RingBufferBase({
        frameSize: 0,
        TypedArrayConstructor: Uint8Array
      });
      return 1;
    },
    {
      instanceOf: RingBufferException,
      message: [
        '"0" is not a valid value for Frame Size. It failed to following validations:\n',
        "\t- It must be at least 1."
      ].join("")
    }
  );
});

test("it should not accept floating point frame size", (t) => {
  t.throws(
    () => {
      new RingBufferBase({
        frameSize: 1.5,
        TypedArrayConstructor: Uint8Array
      });
    },
    {
      instanceOf: Error,
      message: [
        '"1.5" is not a valid value for Frame Size. It failed to following validations:\n',
        "\t- It must be an integer."
      ].join("")
    }
  );
});

test("it should not return the count for incomplete frames", (t) => {
  const rb = new RingBufferBase({
    frameSize: 8,
    TypedArrayConstructor: Uint8Array
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
        TypedArrayConstructor: Uint8Array
      });
    },
    {
      instanceOf: Error,
      message: [
        '"0" is not a valid value for Preallocate Frame Count. It failed to following validations:\n',
        "\t- It must be at least 1."
      ].join("")
    }
  );
});

test("it should only return full frames", (t) => {
  const rb = new RingBufferBase({
    frameSize: 100,
    TypedArrayConstructor: Uint8Array
  });
  rb.write(
    new Uint8Array([
      ...new Array(100).fill(1),
      ...new Array(100).fill(2)
    ])
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
      ...new Uint8Array(100).fill(4)
    ])
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
      ...new Uint8Array(40).fill(5)
    ])
  );
  t.deepEqual(rb.read(), new Uint8Array(100).fill(1));
  t.deepEqual(rb.read(), new Uint8Array(100).fill(2));
  t.deepEqual(rb.read(), new Uint8Array(100).fill(3));
  t.deepEqual(rb.read(), new Uint8Array(100).fill(4));
  t.deepEqual(rb.read(), null);
  t.deepEqual(rb.read(), null);
  t.deepEqual(rb.drain(), new Uint8Array(40).fill(5));
});

test("it should iterate over the ring buffer using standard `Symbol.asyncIterator`", async (t) => {
  const rb = new RingBufferU8(100);
  rb.write(
    new Uint8Array([
      ...new Uint8Array(100).fill(1),
      ...new Uint8Array(100).fill(2),
      ...new Uint8Array(100).fill(3),
      ...new Uint8Array(100).fill(4),
      ...new Uint8Array(100).fill(5)
    ])
  );
  let count = 0;
  for await (const frame of rb) {
    t.deepEqual(frame, new Uint8Array(100).fill(count + 1));
    count++;
  }
  t.is(count, 5);
});

test("it should iterate over the ring buffer using standard `Symbol.iterator`", (t) => {
  const rb = new RingBufferU8(100);
  rb.write(
    new Uint8Array([
      ...new Uint8Array(100).fill(1),
      ...new Uint8Array(100).fill(2),
      ...new Uint8Array(100).fill(3),
      ...new Uint8Array(100).fill(4),
      ...new Uint8Array(100).fill(5)
    ])
  );
  let count = 0;
  for (const frame of rb) {
    t.deepEqual(frame, new Uint8Array(100).fill(count + 1));
    count++;
  }
  t.is(count, 5);
});

test("it should iterate an empty ring buffer", (t) => {
  const rb = new RingBufferU8(100);
  let count = 0;
  for (const // @ts-expect-error
    frame of rb) {
    count++;
  }
  t.is(count, 0);
});

test("it should read the frames of an iterated ring buffer", (t) => {
  const rb = new RingBufferU8(100);
  rb.write(
    new Uint8Array([
      ...new Uint8Array(100).fill(1),
      ...new Uint8Array(100).fill(2),
      ...new Uint8Array(100).fill(3),
      ...new Uint8Array(100).fill(4),
      ...new Uint8Array(100).fill(5)
    ])
  );

  let count = 0;
  for (const _ of rb) {
    count++;
  }
  t.is(count, 5);

  for (const _ of rb) {
    count++;
  }
  t.is(count, 5);
});

test("it should successfully iterate if more frames are written", (t) => {
  const rb = new RingBufferU8(100);
  rb.write(
    new Uint8Array([
      ...new Uint8Array(100).fill(1),
      ...new Uint8Array(100).fill(2),
      ...new Uint8Array(100).fill(3),
      ...new Uint8Array(100).fill(4),
      ...new Uint8Array(100).fill(5)
    ])
  );

  let count = 0;
  for (const _ of rb) {
    count++;
  }
  t.is(count, 5);

  rb.write(
    new Uint8Array([
      ...new Uint8Array(100).fill(6),
      ...new Uint8Array(100).fill(7),
      ...new Uint8Array(100).fill(8),
      ...new Uint8Array(100).fill(9),
      ...new Uint8Array(100).fill(10)
    ])
  );

  for (const _ of rb) {
    count++;
  }
  t.is(count, 10);
});

test("it should read the valid frames of a ring buffer using if `Array.from` is called with the ring buffer as the first argument", (t) => {
  const rb = new RingBufferU8(100);
  rb.write(
    new Uint8Array([
      ...new Uint8Array(100).fill(1),
      ...new Uint8Array(100).fill(2),
      ...new Uint8Array(100).fill(3),
      ...new Uint8Array(100).fill(4),
      ...new Uint8Array(100).fill(5)
    ])
  );

  Array.from(rb);

  t.deepEqual(rb.remainingFrames(), 0);
});

test("it should not read the frames if the ring buffer wasn't iterated", (t) => {
  const rb = new RingBufferU8(100);
  rb.write(
    new Uint8Array([
      ...new Uint8Array(100).fill(1),
      ...new Uint8Array(100).fill(2),
      ...new Uint8Array(100).fill(3),
      ...new Uint8Array(100).fill(4),
      ...new Uint8Array(100).fill(5)
    ])
  );

  t.deepEqual(rb.remainingFrames(), 5);
});

test("it should read, but not drain the frames if the ring buffer was iterated", async (t) => {
  const frameSize = 100;
  const rb = new RingBufferU8(frameSize);
  const expectedFrameList = [
    new Uint8Array([
      ...new Uint8Array(50).fill(5),
      ...new Uint8Array(50).fill(10)
    ]),
    new Uint8Array([
      ...new Uint8Array(20).fill(5),
      ...new Uint8Array(20).fill(10),
      ...new Uint8Array(20).fill(15),
      ...new Uint8Array(20).fill(20),
      ...new Uint8Array(20).fill(45)
    ]),
    new Uint8Array(100).fill(2),
    new Uint8Array(100).fill(4),
    new Uint8Array(100).fill(8),
    new Uint8Array(100).fill(16),
    new Uint8Array(100).fill(32),
    new Uint8Array(100).fill(64),
    new Uint8Array(100).fill(128),
    new Uint8Array(100).fill(256)
  ];

  const frames = new Uint8Array([
    ...new Uint8Array(50).fill(5),
    ...new Uint8Array(50).fill(10),
    ...new Uint8Array(20).fill(5),
    ...new Uint8Array(20).fill(10),
    ...new Uint8Array(20).fill(15),
    ...new Uint8Array(20).fill(20),
    ...new Uint8Array(20).fill(45),
    ...new Uint8Array(100).fill(2),
    ...new Uint8Array(100).fill(4),
    ...new Uint8Array(100).fill(8),
    ...new Uint8Array(100).fill(16),
    ...new Uint8Array(100).fill(32),
    ...new Uint8Array(100).fill(64),
    ...new Uint8Array(100).fill(128),
    ...new Uint8Array(100).fill(256)
  ]);

  rb.write(frames);

  t.deepEqual(rb.remainingFrames(), 10);

  let frameIndex = 0;

  for (const view of rb) {
    t.deepEqual(view, expectedFrameList[frameIndex]);
    frameIndex++;
  }

  t.deepEqual(rb.remainingFrames(), 0);

  rb.write(frames);

  t.deepEqual(Array.from(rb), expectedFrameList);
});

test("it should rewind the ring buffer", async (t) => {
  const frameSize = 100;
  const rb = new RingBufferU8(frameSize, {
    frameCacheSize: 1
  });
  const expectedFrameList = [
    new Uint8Array([
      ...new Uint8Array(50).fill(5),
      ...new Uint8Array(50).fill(10)
    ]),
    new Uint8Array([
      ...new Uint8Array(20).fill(5),
      ...new Uint8Array(20).fill(10),
      ...new Uint8Array(20).fill(15),
      ...new Uint8Array(20).fill(20),
      ...new Uint8Array(20).fill(45)
    ]),
    new Uint8Array(100).fill(2),
    new Uint8Array(100).fill(4),
    new Uint8Array(100).fill(8),
    new Uint8Array(100).fill(16),
    new Uint8Array(100).fill(32),
    new Uint8Array(100).fill(64),
    new Uint8Array(100).fill(128),
    new Uint8Array(100).fill(256)
  ];

  const frames = new Uint8Array([
    ...new Uint8Array(50).fill(5),
    ...new Uint8Array(50).fill(10),
    ...new Uint8Array(20).fill(5),
    ...new Uint8Array(20).fill(10),
    ...new Uint8Array(20).fill(15),
    ...new Uint8Array(20).fill(20),
    ...new Uint8Array(20).fill(45),
    ...new Uint8Array(100).fill(2),
    ...new Uint8Array(100).fill(4),
    ...new Uint8Array(100).fill(8),
    ...new Uint8Array(100).fill(16),
    ...new Uint8Array(100).fill(32),
    ...new Uint8Array(100).fill(64),
    ...new Uint8Array(100).fill(128),
    ...new Uint8Array(100).fill(256)
  ]);

  rb.write(frames);

  t.deepEqual(rb.remainingFrames(), 10);

  let frameIndex = 0;

  for (const view of rb) {
    t.deepEqual(view, expectedFrameList[frameIndex]);
    frameIndex++;
  }

  t.deepEqual(rb.remainingFrames(), 0);

  rb.write(frames);

  t.deepEqual(Array.from(rb), expectedFrameList);

  t.deepEqual(rb.remainingFrames(), 0);
});

test("that the ring buffer copies the frame buffer if `frameCacheSize` is set", async (t) => {
  const frameSize = 100;
  const rb = new RingBufferU8(frameSize, {
    frameCacheSize: 1
  });

  const frames = new Uint8Array([
    ...new Uint8Array(100).fill(2),
    ...new Uint8Array(100).fill(4)
  ]);

  rb.write(frames);

  const frame1 = rb.read();
  const frame2 = rb.read();

  assert.strict.ok(frame1 !== null);
  assert.strict.ok(frame2 !== null);

  t.not(frame1.buffer, frame2.buffer);
});

test("that the ring buffer starts empty", (t) => {
  const rb = new RingBufferU8(128);

  t.assert(rb.empty());
});

test("that the ring buffer does not copy the frame buffer if `frameCacheSize` is not set", async (t) => {
  const frameSize = 100;
  const rb = new RingBufferU8(frameSize, {
    frameCacheSize: 0
  });

  const frames = new Uint8Array([
    ...new Uint8Array(100).fill(2),
    ...new Uint8Array(100).fill(4)
  ]);

  rb.write(frames);

  const frame1 = rb.read();
  const frame2 = rb.read();

  assert.strict.ok(frame1 !== null);
  assert.strict.ok(frame2 !== null);

  t.is(frame1.buffer, frame2.buffer);
});

test("that the ring buffer copies the frame buffer as soon as the ring buffer read offset reaches the end", async (t) => {
  const frameSize = 32;
  const rb = new RingBufferU8(frameSize, {
    frameCacheSize: 1
  });

  rb.write(new Uint8Array(frameSize).fill(2));
  rb.write(new Uint8Array(frameSize).fill(4));
  rb.write(new Uint8Array(frameSize).fill(8));
  const frame1 = rb.read();
  const frame2 = rb.read();

  assert.strict.ok(frame1 !== null);
  assert.strict.ok(frame2 !== null);

  t.not(
    frame1.buffer,
    frame2.buffer,
    "the first frame is a copy, but the ring buffer frame cache size is 2. " +
    "The ring buffer should only return a copy when the ring buffer read offset reaches the end of the buffer"
  );

  assert.strict.ok(frame1 !== null);
  assert.strict.ok(frame2 !== null);
});

test("that the ring buffer will always spits out a non-corrupted frames", (t) => {
  const frameSize = 32;
  const rb = new RingBufferU8(frameSize, {
    frameCacheSize: 1
  });

  rb.write(new Uint8Array(frameSize).fill(2));
  rb.write(new Uint8Array(frameSize).fill(4));
  rb.write(new Uint8Array(frameSize).fill(8));
  rb.write(new Uint8Array(frameSize).fill(16));
  rb.write(new Uint8Array(frameSize).fill(32));
  rb.write(new Uint8Array(frameSize).fill(64));
  rb.write(new Uint8Array(frameSize).fill(128));

  const frame1 = rb.read();
  const frame2 = rb.read();
  const frame3 = rb.read();
  const frame4 = rb.read();
  const frame5 = rb.read();
  const frame6 = rb.read();
  const frame7 = rb.read();

  assert.strict.ok(frame1 !== null);
  assert.strict.ok(frame2 !== null);
  assert.strict.ok(frame3 !== null);
  assert.strict.ok(frame4 !== null);
  assert.strict.ok(frame5 !== null);
  assert.strict.ok(frame6 !== null);
  assert.strict.ok(frame7 !== null);

  t.deepEqual(frame1, new Uint8Array(frameSize).fill(2));
  t.deepEqual(frame2, new Uint8Array(frameSize).fill(4));
  t.deepEqual(frame3, new Uint8Array(frameSize).fill(8));
  t.deepEqual(frame4, new Uint8Array(frameSize).fill(16));
  t.deepEqual(frame5, new Uint8Array(frameSize).fill(32));
  t.deepEqual(frame6, new Uint8Array(frameSize).fill(64));
  t.deepEqual(frame7, new Uint8Array(frameSize).fill(128));
});

test('that the ring buffer stops eating frames if the async for loop is cancelled', async (t) => {
  const frameSize = 32;
  const rb = new RingBufferU8(frameSize, {
    frameCacheSize: 1
  });

  rb.write(new Uint8Array(frameSize).fill(2));
  rb.write(new Uint8Array(frameSize).fill(4));
  rb.write(new Uint8Array(frameSize).fill(8));
  rb.write(new Uint8Array(frameSize).fill(16));
  rb.write(new Uint8Array(frameSize).fill(32));
  rb.write(new Uint8Array(frameSize).fill(64));
  rb.write(new Uint8Array(frameSize).fill(128));

  for await (const _ of rb) {
    break;
  }

  const frameCount1 = rb.remainingFrames();

  t.is(
    frameCount1,
    6,
    `Expected the ring buffer to stop reading frames if the async for loop is cancelled. (e.g. with a \`break;\` keyword)`
  );
});

test('that the ring buffer stops eating frames if the synchronous for-of loop is cancelled', (t) => {
  const frameSize = 32;
  const rb = new RingBufferU8(frameSize, {
    frameCacheSize: 1
  });

  rb.write(new Uint8Array(frameSize).fill(2));
  rb.write(new Uint8Array(frameSize).fill(4));
  rb.write(new Uint8Array(frameSize).fill(8));
  rb.write(new Uint8Array(frameSize).fill(16));
  rb.write(new Uint8Array(frameSize).fill(32));
  rb.write(new Uint8Array(frameSize).fill(64));
  rb.write(new Uint8Array(frameSize).fill(128));

  for (const _ of rb) {
    break;
  }

  const frameCount1 = rb.remainingFrames();

  t.is(
    frameCount1,
    6,
    `Expected the ring buffer to stop reading frames if the synchronous for-of loop is cancelled. (e.g. with a \`break;\` keyword)`
  );
});

test('that you can still read frames ring buffer can still read frames after the async for loop is cancelled', async (t) => {
  const frameSize = 32;
  const rb = new RingBufferU8(frameSize, {
    frameCacheSize: 1
  });

  rb.write(new Uint8Array(frameSize).fill(2));
  rb.write(new Uint8Array(frameSize).fill(4));
  rb.write(new Uint8Array(frameSize).fill(8));
  rb.write(new Uint8Array(frameSize).fill(16));
  rb.write(new Uint8Array(frameSize).fill(32));
  rb.write(new Uint8Array(frameSize).fill(64));
  rb.write(new Uint8Array(frameSize).fill(128));

  // Frame missed
  for await (const _ of rb) {
    break;
  }

  // Since frame 2
  const frame2 = rb.read();
  t.deepEqual(frame2, new Uint8Array(frameSize).fill(4));

  // Frame missed
  for await (const _ of rb) {
    break;
  }

  // Since frame 4
  const frame4 = rb.read();
  t.deepEqual(frame4, new Uint8Array(frameSize).fill(16));

  const frame5 = rb.read();
  t.deepEqual(frame5, new Uint8Array(frameSize).fill(32));

  const frame6 = rb.read();
  t.deepEqual(frame6, new Uint8Array(frameSize).fill(64));

  const frame7 = rb.read();
  t.deepEqual(frame7, new Uint8Array(frameSize).fill(128));
});

test('that you can still read frames from the ring buffer after the synchronous for-of loop is cancelled ', (t) => {
  const frameSize = 32;
  const rb = new RingBufferU8(frameSize, {
    frameCacheSize: 1
  });

  rb.write(new Uint8Array(frameSize).fill(2));
  rb.write(new Uint8Array(frameSize).fill(4));
  rb.write(new Uint8Array(frameSize).fill(8));
  rb.write(new Uint8Array(frameSize).fill(16));
  rb.write(new Uint8Array(frameSize).fill(32));
  rb.write(new Uint8Array(frameSize).fill(64));
  rb.write(new Uint8Array(frameSize).fill(128));

  // Frame missed
  for (const _ of rb) {
    break;
  }

  // Since frame 2
  const frame2 = rb.read();
  t.deepEqual(frame2, new Uint8Array(frameSize).fill(4));

  // Frame missed
  for (const _ of rb) {
    break;
  }

  // Since frame 4
  const frame4 = rb.read();
  t.deepEqual(frame4, new Uint8Array(frameSize).fill(16));

  const frame5 = rb.read();
  t.deepEqual(frame5, new Uint8Array(frameSize).fill(32));

  const frame6 = rb.read();
  t.deepEqual(frame6, new Uint8Array(frameSize).fill(64));

  const frame7 = rb.read();
  t.deepEqual(frame7, new Uint8Array(frameSize).fill(128));
});

test('that you can still read frames from the ring buffer after the synchronous for-of loop is cancelled and frame cache size is 0', (t) => {
  const frameSize = 32;
  const rb = new RingBufferU8(frameSize, {
    frameCacheSize: 0
  });

  rb.write(new Uint8Array(frameSize).fill(2));
  rb.write(new Uint8Array(frameSize).fill(4));
  rb.write(new Uint8Array(frameSize).fill(8));
  rb.write(new Uint8Array(frameSize).fill(16));
  rb.write(new Uint8Array(frameSize).fill(32));
  rb.write(new Uint8Array(frameSize).fill(64));
  rb.write(new Uint8Array(frameSize).fill(128));

  // Frame missed
  for (const _ of rb) {
    break;
  }

  // Since frame 2
  const frame2 = rb.read();
  t.deepEqual(frame2, new Uint8Array(frameSize).fill(4));

  // Frame missed
  for (const _ of rb) {
    break;
  }

  // Since frame 4
  const frame4 = rb.read();
  t.deepEqual(frame4, new Uint8Array(frameSize).fill(16));

  const frame5 = rb.read();
  t.deepEqual(frame5, new Uint8Array(frameSize).fill(32));

  const frame6 = rb.read();
  t.deepEqual(frame6, new Uint8Array(frameSize).fill(64));

  const frame7 = rb.read();
  t.deepEqual(frame7, new Uint8Array(frameSize).fill(128));
});

test("it should reallocate buffer when writing beyond initial capacity", (t) => {
  const rb = new RingBufferU8(10, { preallocateFrameCount: 1 });
  const initialBufferSize = rb.peek().length;
  t.is(initialBufferSize, 10);

  rb.write(new Uint8Array(20).fill(5));
  t.true(rb.peek().length >= 20);

  const frame1 = rb.read();
  t.deepEqual(frame1, new Uint8Array(10).fill(5));
  const frame2 = rb.read();
  t.deepEqual(frame2, new Uint8Array(10).fill(5));
});

test("peek should return remaining data after partial read", (t) => {
  const rb = new RingBufferU8(100);
  rb.write(new Uint8Array(200).fill(1));
  rb.read();
  const remaining = rb.peek().subarray(0, 100);
  t.deepEqual(remaining, new Uint8Array(100).fill(1));
});

test("drain should return all remaining samples even if not a full frame", (t) => {
  const rb = new RingBufferU8(100);
  rb.write(new Uint8Array(150).fill(3));
  const drained = rb.drain();
  t.deepEqual(drained, new Uint8Array(150).fill(3));
  t.true(rb.empty());
});

test("writing an empty array does not change the buffer state", (t) => {
  const rb = new RingBufferU8(100);
  t.true(rb.empty());
  rb.write(new Uint8Array(0));
  t.true(rb.empty());
});

test("initial buffer size is based on preallocateFrameCount and frameSize", (t) => {
  const frameSize = 10;
  const preallocate = 5;
  const rb = new RingBufferU8(frameSize, { preallocateFrameCount: preallocate });
  t.is(rb.peek().length, frameSize * preallocate);
});

test("RingBufferS16 handles negative values correctly", (t) => {
  const rb = new RingBufferS16(2);
  const data = new Int16Array([-1, 2, -3, 4]);
  rb.write(data);
  t.deepEqual(rb.read(), new Int16Array([-1, 2]));
  t.deepEqual(rb.read(), new Int16Array([-3, 4]));
});

test("after draining, read returns null", (t) => {
  const rb = new RingBufferU8(100);
  rb.write(new Uint8Array(100).fill(1));
  rb.drain();
  t.is(rb.read(), null);
});

test("consecutive writes and reads maintain correct state", (t) => {
  const rb = new RingBufferU8(2);
  rb.write(new Uint8Array([1, 2]));
  rb.write(new Uint8Array([3, 4]));
  t.deepEqual(rb.read(), new Uint8Array([1, 2]));
  rb.write(new Uint8Array([5, 6]));
  t.deepEqual(rb.read(), new Uint8Array([3, 4]));
  t.deepEqual(rb.read(), new Uint8Array([5, 6]));
});

test("frameSize of 1 works correctly", (t) => {
  const rb = new RingBufferU8(1);
  rb.write(new Uint8Array([1, 2, 3]));
  t.is(rb.remainingFrames(), 3);
  t.deepEqual(rb.read(), new Uint8Array([1]));
  t.deepEqual(rb.read(), new Uint8Array([2]));
  t.deepEqual(rb.read(), new Uint8Array([3]));
});

test("handles large number of frames correctly", (t) => {
  const frameSize = 10;
  const rb = new RingBufferU8(frameSize);
  const totalFrames = 1000;
  const data = new Uint8Array(totalFrames * frameSize).fill(5);
  rb.write(data);
  let count = 0;
  while (rb.remainingFrames() > 0) {
    const frame = rb.read();
    t.deepEqual(frame, new Uint8Array(frameSize).fill(5));
    count++;
  }
  t.is(count, totalFrames);
});

test("after trimming, new writes start at buffer beginning", (t) => {
  const rb = new RingBufferU8(100, { frameCacheSize: 1 });
  rb.write(new Uint8Array(300).fill(1));
  rb.read();
  rb.write(new Uint8Array(50).fill(2));
  const drained = rb.drain();
  assert.strict.ok(drained !== null);
  t.is(drained.length, 250);
  t.deepEqual(drained.subarray(0, 200), new Uint8Array(200).fill(1));
  t.deepEqual(drained.subarray(200), new Uint8Array(50).fill(2));
});

test("writing less than a full frame does not increase remainingFrames", (t) => {
  const rb = new RingBufferU8(100);
  rb.write(new Uint8Array(99));
  t.is(rb.remainingFrames(), 0);
});

for (const [TypedArray, expectedToStringTagValue] of [
  [RingBufferU8, 'RingBufferU8'],
  [RingBufferU16, 'RingBufferU16'],
  [RingBufferU32, 'RingBufferU32'],
  [RingBufferS16, 'RingBufferS16'],
  [RingBufferS32, 'RingBufferS32'],
  [RingBufferF32, 'RingBufferF32'],
] as const) {
  test(`${expectedToStringTagValue}: instance has correct Symbol.toStringTag`, (t) => {
    const rb = new TypedArray(100);
    t.is(rb[Symbol.toStringTag], expectedToStringTagValue);
  });
}