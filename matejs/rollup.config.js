const flow = require('rollup-plugin-flow')
const {terser} = require('rollup-plugin-terser')

export default {
  input: 'src/index.js',
  output: {format: 'cjs', file: './lib/lib.js'},
  plugins: [flow({pretty: true}), terser()],
  external: ['ramda', 'rxjs', 'immutable'],
}
