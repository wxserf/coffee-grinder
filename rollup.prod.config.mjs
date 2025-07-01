/**
 * Rollup configuration for production builds.
 */
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import alias from '@rollup/plugin-alias';
import analyze from 'rollup-plugin-analyzer';
import replace from '@rollup/plugin-replace';

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
    plugins: [
      replace({ preventAssignment: true, 'window.NODE_ENV': JSON.stringify(process.env.NODE_ENV) }),
      resolve(),
      commonjs()
    ],
    treeshake: { moduleSideEffects: false }
  },
  {
    input: 'src/scripts/main.js',
    output: {
      file: 'dist/bundle.js',
      format: 'iife',
      name: 'CoffeeGrinderApp',
      sourcemap: false
    },
    plugins: [
      pathAliases,
      replace({ preventAssignment: true, 'window.NODE_ENV': JSON.stringify(process.env.NODE_ENV) }),
      resolve(),
      commonjs(),
      analyze({ summaryOnly: true, html: 'docs/bundleReport.html' })
    ],
    treeshake: { moduleSideEffects: false }
  },
  {
    input: 'src/workers/specWorker.js',
    output: {
      file: 'dist/worker.bundle.js',
      format: 'iife',
      name: 'CoffeeGrinderWorker',
      sourcemap: false
    },
    plugins: [
      pathAliases,
      replace({ preventAssignment: true, 'window.NODE_ENV': JSON.stringify(process.env.NODE_ENV) }),
      resolve(),
      commonjs()
    ],
    treeshake: { moduleSideEffects: false }
  }
];
