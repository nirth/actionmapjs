import chai, {expect} from 'chai'
import dirtyChai from 'dirty-chai'
import sinonChai from 'sinon-chai'
import sinonChaiInOrder from 'sinon-chai-in-order'
import {spy} from 'sinon'

chai.use(dirtyChai)
chai.use(sinonChai)
chai.use(sinonChaiInOrder)

import parseSelectors, {bdd} from './parseSelectors'
const {simpleSelectorFactory} = bdd


describe('parseSelectors should', () => {
  it('exists', () => {
    expect(parseSelectors).to.exist()
    expect(parseSelectors).to.be.a('function')
  })

  it('be able to parse list of properties to Selectors', () => {
    const blue = 'Blue'
    const square = 'Square'
    const sampleState = {color: blue, shape: square}
    const selectors = parseSelectors(['color', 'shape'])

    selectors.forEach(([property, selector]) => expect(selector(sampleState)).to.equal(sampleState[property]))
  })

  it('be able to parse map of properties and selectors to Selectors', () => {
    const blue = 'Blue'
    const square = 'Square'
    const sampleState = {color: blue, shape: square}
    const selectors = parseSelectors({color: (state) => state.color, shape: (state) => state.shape})

    selectors.forEach(([property, selector]) => expect(selector(sampleState)).to.equal(sampleState[property]))
  })

})

describe('simpleSelectorFactory should', () => {
  it('exist', () => {
    expect(simpleSelectorFactory).to.exist()
    expect(simpleSelectorFactory).to.be.a('function')
  })

  it('create accessors for individual properties defined in argument', () => {
    const blue = 'Blue'
    const square = 'Square'
    const sampleState = {color: blue, shape: square}
    const selectColor = simpleSelectorFactory('color')
    const selectShape = simpleSelectorFactory('shape')

    expect(selectColor(sampleState)).to.equal(blue)
    expect(selectShape(sampleState)).to.equal(square)
  })
})
