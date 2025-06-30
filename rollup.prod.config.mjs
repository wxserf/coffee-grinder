/**
 * Rollup configuration for production builds.
 * Source maps are disabled for smaller output.
 */

import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import alias from '@rollup/plugin-alias';

const pathAliases = alias({
  entries: [
    { find: '@components', replacement: 'src/components' },
    { find: '@services', replacement: 'src/services' },
    { find: '@workers', replacement: 'src/workers' },
    { find: '@validators', replacement: 'src/validators' },
    { find: '@utils', replacement: 'src/utils' },
    { find: '@templates', replacement: 'src/templates' }
  ]
});

export default [
  {
    input: 'src/scripts/vendor.js',
    output: {
      file: 'dist/vendor.js',
      format: 'iife',
      name: 'VendorLibs'
    },
    plugins: [resolve(), commonjs()],
    treeshake: { moduleSideEffects: false }
  },
  {
    input: 'src/scripts/main.js',
    output: {
      file: 'dist/bundle.js',
      format: 'iife',
      name: 'CoffeeGrinderApp',
      sourcemap: false,
    },
    plugins: [pathAliases, resolve(), commonjs()],
    treeshake: { moduleSideEffects: false }
  },
  {
    input: 'src/workers/specWorker.js',
    output: {
      file: 'dist/worker.bundle.js',
      format: 'iife',
      name: 'CoffeeGrinderWorker',
      sourcemap: false,
    },
    plugins: [pathAliases, resolve(), commonjs()],
    treeshake: { moduleSideEffects: false }
  }
];
