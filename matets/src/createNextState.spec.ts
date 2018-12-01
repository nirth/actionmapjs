import * as chai from 'chai'
import * as dirtyChai from 'dirty-chai'

import {allowEventType, eventMap, flatEventMapField} from './utils'
import createNextState from './createNextState'

import {createPerson, createPersonsStateFixture, createPet, flatFixtures} from './test.fixtures'
import {EventMap, State} from './mate'

const {expect} = chai
chai.use(dirtyChai)

type StateAndMapFixture = {
  eventMap: EventMap
  initialState: State
}

describe('createNextState should', () => {
  it('exist', () => {
    expect(createNextState).to.be.a('function')
  })

  it('show both substate and full state to transformers', () => {
    const initialState = {a: 1, b: 2, c: 3, sum: 0}
    const computeSum = (_1, _2, state) => {
      expect(state).to.deep.equal({a: 1, b: 2, c: 3, sum: 0})
      const {a, b, c} = state
      return a + b + c
    }
    const counterEventMap: EventMap = eventMap(flatEventMapField('sum', allowEventType('sum'), computeSum))
    const stateOne = createNextState(counterEventMap, initialState, 'sum', true)
    expect(stateOne).to.deep.equal({a: 1, b: 2, c: 3, sum: 6})
  })

  it('create next state for simple (flat) event map', () => {
    const fixtures = flatFixtures()
    const counterEventMap: EventMap = fixtures.eventMap as EventMap
    const initialState: State = fixtures.initialState
    const stateOne = createNextState(counterEventMap, initialState, 'initialize', true)

    expect(stateOne).to.deep.equal({initialized: true, numTimesRefreshed: 0})
    const stateTwo = createNextState(counterEventMap, stateOne, 'refresh', 0)
    expect(stateTwo).to.deep.equal({initialized: true, numTimesRefreshed: 1})
    const stateThree = createNextState(counterEventMap, stateTwo, 'refresh', 1)
    expect(stateThree).to.deep.equal({initialized: true, numTimesRefreshed: 2})
  })
})
