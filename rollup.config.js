import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify';

export default {
  input: './remote.js',
  output: {
    file: './dist/remote.js',
    format: 'cjs',
  },
  plugins: [
    resolve({
      main: true,
      browser: true,
    }),
    commonjs(),
    babel({
      exclude: 'node_modules/**',
    }),
    uglify(),
  ],
};
