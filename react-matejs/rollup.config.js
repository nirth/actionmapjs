const flow = require('rollup-plugin-flow')
const {terser} = require('rollup-plugin-terser')
const babel = require('rollup-plugin-babel')

export default {
  input: 'src/index.js',
  output: {format: 'cjs', file: './lib/lib.js'},
  plugins: [flow({pretty: true}), babel({exclude: 'node_modules/**'}), terser()],
  external: ['react', 'react-proptypes'],
}
