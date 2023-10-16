# RingBud: A Zero-Dependency, High-Performance RingBuffer Library

![version](https://img.shields.io/badge/version-1.0.0-blue)
![TypeScript](https://img.shields.io/badge/-TypeScript-blue)
![license](https://img.shields.io/badge/license-MIT-green)
![dependencies](https://img.shields.io/badge/dependencies-0-orange)

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Features](#features)
- [Usage](#usage)
  - [Basic Usage](#basic-usage)
  - [Advanced Features](#advanced-features)
- [Zero Dependencies](#zero-dependencies)
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

## Usage

### Basic Usage

Here is a quick example to get you started:

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

```typescript
// Drain all available data from the buffer
const allData = buffer.drain();
```

## Zero Dependencies

This library has zero external dependencies, making it extremely lightweight and easy to integrate.

## License

RingBud is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
