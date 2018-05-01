import chai, {expect} from 'chai'
import dirtyChai from 'dirty-chai'
import sinonChai from 'sinon-chai'
import sinonChaiInOrder from 'sinon-chai-in-order'
import {spy} from 'sinon'

import toEventMapAndInitialState from './toEventMapAndInitialState'

chai.use(dirtyChai)
chai.use(sinonChai)
chai.use(sinonChaiInOrder)

const fixtures = {
  calculator: {
    result: {
      value: 0, // REVIEW: Consider having Value | Function?
      actions: [
        [allowEventType('add'), (payload, value) => value + payload],
        [allowEventType('subtract'), (payload, value) => value - payload],
        [allowEventType('multiply'), (payload, value) => value * payload],
        [allowEventType('divide'), (payload, value) => value / payload],
      ],
    },
  },
  game: {
    ui,
  },
}

describe('toEventMapAndInitialState should', () => {
  it('exist', () => expect(toEventMapAndInitialState).to.be.a('function'))

  it('parse shallow instructions (shallowInstructions), into shallow eventMap and initialState', {})
})
