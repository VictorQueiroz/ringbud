# RingBud: A Zero-Dependency, High-Performance RingBuffer Library

![version](https://img.shields.io/badge/version-1.0.4-blue)
![TypeScript](https://img.shields.io/badge/-TypeScript-blue)
![license](https://img.shields.io/badge/license-MIT-green)
![dependencies](https://img.shields.io/badge/dependencies-0-orange)
![package size](https://img.shields.io/badge/package size-8.2 kB-yellow)
![unpacked size](https://img.shields.io/badge/unpacked size-36.5 kB-yellowgreen)

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Features](#features)
- [Usage](#usage)
  - [Basic Usage](#basic-usage)
  - [Advanced Features](#advanced-features)
- [Memory Preallocation and Performance](#memory-preallocation-and-performance)
- [Extensibility with Typed Arrays](#extensibility-with-typed-arrays)
- [Zero Dependencies](#zero-dependencies)
- [Package Size](#package-size)
- [License](#license)

## Introduction

RingBud is a high-performance, TypeScript-based RingBuffer library designed for efficient data storage and retrieval. It provides an API optimized for both ease-of-use and fine-grained control.

## Installation

You can install RingBud using npm:

```bash
npm install ringbud
```

Or using yarn:

```bash
yarn add ringbud
```

## Features

- **Type-Safe**: Written in TypeScript, ensuring robust type safety.
- **Memory-Efficient**: Optimized memory management for high-throughput applications.
- **Customizable**: Adjustable frame size for various use-cases.
- **Fast Read/Write**: Optimized algorithms for quick data access.
- **Zero Dependencies**: Absolutely no external dependencies.
- **Small Footprint**: The package size is just 8.2 kB with an unpacked size of 36.5 kB.

## Usage

### Basic Usage

Here is a quick example to get you started:

```typescript
import { RingBufferF32 } from "ringbud";

const frameSize = 128;
const buffer = new { RingBufferF32 }(frameSize);

// Write data into the buffer
const data = new Float32Array([1.1, 2.2, 3.3]);
buffer.write(data);

// Read data from the buffer
const readData = buffer.read();
```

### Advanced Features

```typescript
// Drain all available data from the buffer
const allData = buffer.drain();
```

## Memory Preallocation and Performance

RingBud preallocates memory based on the frame size provided during the initialization, which offers significant performance advantages. Preallocation of memory reduces the overhead of dynamic memory allocation, thereby making read and write operations faster.

## Extensibility with Typed Arrays

RingBud is now more extensible and supports a variety of Typed Arrays, including Float32Array, Int16Array, Int32Array, Uint8Array, Uint16Array, Uint32Array, and Uint8ClampedArray. This makes it incredibly flexible for different data storage requirements.

## Zero Dependencies

This library has zero external dependencies, making it extremely lightweight and easy to integrate.

## Package Size

- Package size: 8.2 kB
- Unpacked size: 36.5 kB
- Total files: 40

## License

RingBud is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
