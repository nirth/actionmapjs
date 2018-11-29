import chai, {expect} from 'chai'
import dirtyChai from 'dirty-chai'
import sinonChai from 'sinon-chai'
import sinonChaiInOrder from 'sinon-chai-in-order'
import {spy} from 'sinon'

import {eventMap} from './utils'

chai.use(dirtyChai)
chai.use(sinonChai)
chai.use(sinonChaiInOrder)

describe('Function eventMap should', () => {
  it('exist', () => expect(eventMap).to.be.a('function'))

  it('create a valid event map', () => {
    const age = ['age', true, () => 99]
    const color = ['color', true, () => 'orange']
    const ageAndColorMap = eventMap(age, color)

    expect(ageAndColorMap).to.deep.equal([age, color])
  })
})
