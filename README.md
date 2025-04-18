# RingBud

> A lightweight, high-performance Ring Buffer for streaming data using JavaScript `TypedArray`s.

## Features

- 🧠 **Frame-based buffering** (configurable frame size)
- ⚡ **Zero dependencies**
- 🧵 **Supports all major TypedArrays** (e.g. `Float32Array`, `Uint8Array`, etc.)
- 📦 **Memory efficient** with optional frame trimming
- 🔁 **Sync & async iteration support**
- ✅ **Fully tested** and predictable behavior
- 🧰 **Customizable preallocation and cache options**

---

## Installation

```bash
npm install ringbud
```

---

## Quick Start

```ts
import { RingBufferU8 } from "ringbud";

// Create a ring buffer with frame size of 100
const rb = new RingBufferU8(100);

// Write 50 bytes (not enough for a full frame)
rb.write(new Uint8Array(50).fill(1));
console.log(rb.empty()); // true

// Write 50 more bytes (now we have a complete frame)
rb.write(new Uint8Array(50).fill(1));
console.log(rb.empty()); // false

// Read one frame of 100 bytes
const frame = rb.read();
console.log(frame); // Uint8Array(100)

// After reading, it becomes empty again
console.log(rb.empty()); // true
```

---

## Supported Types

You can instantiate ring buffers for:

- `Uint8Array` → `RingBufferU8`
- `Uint16Array` → `RingBufferU16`
- `Float32Array` → `RingBufferF32`

Each subclass wraps the base `RingBufferBase` with preconfigured types.

---

## Configuration Options

All constructors accept:

```ts
{
  frameSize: number,                // Number of elements per frame (required)
  preallocateFrameCount?: number,  // Default: 10
  frameCacheSize?: number          // Default: 0 (no trim)
}
```

### Frame Cache Size (Clamping)

When `frameCacheSize > 0`, the ring buffer trims memory usage by shifting unread bytes after every `.read()`. This reduces buffer growth at the cost of additional memory copying.

---

## API Reference

### Constructor

```ts
new RingBufferU8(frameSize: number, options?: {
  preallocateFrameCount?: number;
  frameCacheSize?: number;
});
```

### Methods

| Method              | Description |
|---------------------|-------------|
| `write(data)`       | Appends a `TypedArray` to the buffer |
| `read()`            | Returns the next full frame, or `null` |
| `drain()`           | Returns remaining **incomplete** data |
| `peek()`            | Returns the entire buffer content (not a copy) |
| `empty()`           | `true` if no full frame is available |
| `remainingFrames()` | Number of full frames available to read |
| `rewind()`          | Resets read offset so frames can be re-read |
| `Symbol.iterator()` | Enables `for (const frame of buffer)` |
| `Symbol.asyncIterator()` | Enables `for await (const frame of buffer)` |

---

## Example: Iteration

```ts
for (const frame of rb) {
  console.log(frame); // each is a complete frame
}

// or async
for await (const frame of rb) {
  await process(frame);
}
```

---

## Example: Auto-Trimming

```ts
const rb = new RingBufferU8(100, { frameCacheSize: 1 });

rb.write(new Uint8Array(300)); // 3 frames
rb.read();                     // returns 1st frame

// Buffer automatically shifts remaining frames to the front
rb.peek().subarray(0, 200);    // contains frame 2 and 3
```

---

## Validations & Safety

- `frameSize` must be an integer ≥ 1
- `preallocateFrameCount` must be ≥ 1 (if set)
- Partial frames are never returned from `.read()` or iterators
- Trimming only occurs **after** reads when `frameCacheSize > 0`
- If iteration is used, all frames are consumed as if `.read()` was called repeatedly
- Frames can be shared or copied depending on cache config

---

## TypedArray Support

Internally, the base class accepts any `TypedArray` constructor:

```ts
new RingBufferBase({
  frameSize: 256,
  TypedArrayConstructor: Uint16Array
});
```

Built-in classes like `RingBufferF32` are wrappers over this API.

---

## Examples

### Draining Partial Data

```ts
const rb = new RingBufferU8(100);

rb.write(new Uint8Array(230));
rb.read();           // reads 1 frame (100 bytes)
rb.read();           // reads 1 more frame (100 bytes)
rb.read();           // null (30 bytes left)

rb.drain();          // returns 30 bytes
```

### Rewind

```ts
rb.rewind();         // enables re-reading all written frames
for (const frame of rb) {
  console.log(frame);
}
```

---
