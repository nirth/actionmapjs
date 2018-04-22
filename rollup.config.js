const flow = require('rollup-plugin-flow')
const uglify = require('rollup-plugin-uglify')

export default {
  input: 'src/index.js',
  output: {format: 'cjs', file: './lib/lib.js'},
  plugins: [flow({pretty: true}), uglify()],
  external: ['ramda', 'rxjs', 'immutable'],
}
