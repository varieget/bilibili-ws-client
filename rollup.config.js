import { defineConfig } from 'rollup';
import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import nodePolyfills from 'rollup-plugin-polyfill-node';

const extensions = ['.ts', '.js', '.tsx', '.jsx'];

export default defineConfig([
  {
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
    external: ['ws', 'isomorphic-ws'],
    plugins: [
      commonjs(),
      nodeResolve({ extensions }),
      babel({ extensions, babelHelpers: 'bundled' }),
    ],
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'lib/index.umd.js',
      format: 'umd',
      name: 'Client',
      plugins: [terser()],
      globals: {
        ws: 'WebSocket',
        'isomorphic-ws': 'WebSocket',
      },
    },
    external: ['ws', 'isomorphic-ws'],
    plugins: [
      nodePolyfills(),
      nodeResolve({ extensions }),
      babel({ extensions, babelHelpers: 'bundled' }),
    ],
  },
]);
