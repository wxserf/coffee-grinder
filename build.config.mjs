/**
 * Simple Rollup config for bundling main.js and worker.js with dependencies for browser usage.
 */

import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [
  {
    input: 'src/scripts/main.js',
    output: {
      file: 'dist/bundle.js',
      format: 'iife',
      name: 'CoffeeGrinderApp',
      sourcemap: true,
    },
    plugins: [resolve(), commonjs()]
  },
  {
    input: 'src/workers/specWorker.js',
    output: {
      file: 'dist/worker.bundle.js',
      format: 'iife',
      name: 'CoffeeGrinderWorker',
      sourcemap: true,
    },
    plugins: [resolve(), commonjs()]
  }
];
