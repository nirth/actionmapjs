const flow = require('rollup-plugin-flow')
const uglify = require('rollup-plugin-uglify')

export default {
  entry: 'src/index.js',
  format: 'cjs',
  dest: './lib/lib.js',
  plugins: [flow({pretty: true})],
  external: ['ramda'],
}
