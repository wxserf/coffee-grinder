/**
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

export default {
  input: 'src/scripts/main.js',
  output: {
    file: 'dist/bundle.js',
    format: 'iife',
    name: 'CoffeeGrinderApp',
  },
  plugins: [
    pathAliases,
    resolve(),
    commonjs(),
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': stringify('production')
    }),
    terser(),
    analyze()
  ],
  treeshake: { moduleSideEffects: false }
};
