import { defineConfig } from 'rollup';
import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import eslint from '@rollup/plugin-eslint';
import nodeResolve from '@rollup/plugin-node-resolve';

const extensions = ['.ts', '.js', '.tsx', '.jsx'];

export default defineConfig({
  input: 'src/index.ts',
  output: [
    {
      file: 'lib/index.cjs.js',
      format: 'cjs',
      exports: 'default',
    },
    {
      file: 'lib/index.esm.js',
      format: 'esm',
    },
  ],
  external: ['ws'],
  plugins: [
    nodeResolve({ extensions }),
    eslint(),
    babel({ extensions, babelHelpers: 'bundled' }),
    commonjs(),
  ],
});
