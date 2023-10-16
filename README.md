# RingBud: Zero-Dependency, High-Performance RingBuffer Library

![version](https://img.shields.io/badge/version-1.1.0-blue)
![TypeScript](https://img.shields.io/badge/-TypeScript-blue)
![license](https://img.shields.io/badge/license-MIT-green)
![dependencies](https://img.shields.io/badge/dependencies-0-orange)
![package size](https://img.shields.io/badge/package%20size-8.2%20kB-yellow)
![unpacked size](https://img.shields.io/badge/unpacked%20size-36.5%20kB-yellowgreen)

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Features](#features)
  - [New: Clamping](#new-clamping)
- [Usage](#usage)
  - [Basic Usage](#basic-usage)
  - [Advanced Features](#advanced-features)
- [Memory Management](#memory-management)
  - [Memory Preallocation](#memory-preallocation)
  - [Clamping for Large Buffers](#clamping-for-large-buffers)
- [Extensibility with Typed Arrays](#extensibility-with-typed-arrays)
- [Zero Dependencies](#zero-dependencies)
- [Package Size](#package-size)
- [License](#license)

## Introduction

RingBud is a high-performance, TypeScript-based RingBuffer library engineered for efficient data storage and retrieval. The API is designed to be both user-friendly and versatile, allowing fine-grained control over buffer operations.

## Installation

To install RingBud, you can use npm:

```bash
npm install ringbud
```

Or yarn:

```bash
yarn add ringbud
```

## Features

- **Type-Safe**: Fully written in TypeScript for robust type safety.
- **Memory-Efficient**: Features like preallocation and clamping optimize memory usage.
- **Customizable**: Adjustable frame size to fit diverse application requirements.
- **High-Speed Read/Write**: Employs optimized algorithms for rapid data access.
- **Zero Dependencies**: Completely standalone with no external dependencies.
- **Lightweight**: A minuscule package footprint for efficient deployment.

### New: Clamping

The library now includes a clamping feature, enabled by default. When clamping is enabled, the remaining bytes in the buffer are moved to the beginning after each read operation. This avoids the need for resizing the buffer for new data, thereby optimizing memory usage. The trade-off is that the buffer is copied upon each read operation.

## Usage

### Basic Usage

Here's a quick example to get started:

```typescript
import { RingBufferF32 } from "ringbud";

const frameSize = 128;
const buffer = new RingBufferF32(frameSize);

// Write data into the buffer
const data = new Float32Array([1.1, 2.2, 3.3]);
buffer.write(data);

// Read data from the buffer
const readData = buffer.read();
```

### Advanced Features

Drain all available data from the buffer:

```typescript
const allData = buffer.drain();
```

## Memory Management

### Memory Preallocation

RingBud preallocates memory based on your specified frame size, offering significant performance benefits by reducing the overhead of dynamic memory allocation.

### Clamping for Large Buffers

With the new clamping feature, RingBud can handle large buffers efficiently without resizing the memory, albeit at the cost of copying the buffer during each read operation.

## Extensibility with Typed Arrays

RingBud supports a broad spectrum of Typed Arrays, including Float32Array, Int16Array, Int32Array, Uint8Array, Uint16Array, Uint32Array, and Uint8ClampedArray, providing unparalleled flexibility for different data storage needs.

## Zero Dependencies

The library is self-contained and does not rely on any external dependencies, making it highly portable and easy to integrate.

## Package Size

- Package size: 8.2 kB
- Unpacked size: 36.5 kB
- Total files: 40

## License

RingBud is licensed under the MIT License. For more details, see the [LICENSE](LICENSE) file.
