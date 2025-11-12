// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [
  {
    input: 'src/content.js',
    output: {
      file: 'dist/content-bundle.js',
      format: 'iife',
      name: 'KokoroTTSContent'
    },
    plugins: [
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs()
    ]
  }
];
