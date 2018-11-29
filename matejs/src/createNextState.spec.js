import chai, {expect} from 'chai'
import dirtyChai from 'dirty-chai'

import {allowEventType} from './utils'
import {createNextState, processEventMap} from './createNextState'
import {createPersonsStateFixture, createPerson, createPet} from './test.fixtures.js'

chai.use(dirtyChai)

const initializeApp = () => true
const updateName = (name) => name
const updateAge = (age) => age
const updateFirstName = (firstName) => firstName
const updateLastName = (lastName) => lastName

const flatFixtures = () => ({
  initialState: {
    initialized: false,
    numTimesRefreshed: 0,
  },
  eventMap: [
    ['initialized', allowEventType('initialize'), () => true],
    ['numTimesRefreshed', allowEventType('refresh'), (prev) => prev + 1],
  ],
})

const oneLevelDeepFixtures = () => ({
  initialState: {
    initialized: false,
    user: {
      name: null,
      age: null,
    },
  },
  eventMap: [
    ['initialized', allowEventType('initialize'), () => true],
    [
      'user',
      true,
      [['name', allowEventType('updateName'), updateName], ['age', allowEventType('updateAge'), updateAge]],
    ],
  ],
})

const twoLevelDeepFixtures = () => ({
  initialState: {
    initialized: false,
    user: {
      name: {
        firstName: null,
        lastName: null,
      },
      age: null,
    },
  },
  eventMap: [
    ['initialized', allowEventType('initialize'), initializeApp],
    [
      'user',
      true,
      [
        [
          'name',
          true,
          [
            ['firstName', allowEventType('updateFirstName'), updateFirstName],
            ['lastName', allowEventType('updateLastName'), updateLastName],
          ],
        ],
        ['age', allowEventType('updateAge'), updateAge],
      ],
    ],
  ],
})

describe('createNextState should', () => {
  it('exist', () => {
    expect(createNextState).to.exist()
    expect(createNextState).to.be.a('function')
  })

  it('show both substate and full state to transformers', () => {
    const initialState = {a: 1, b: 2, c: 3, sum: 0}
    const computeSum = (_1, _2, state) => {
      expect(state).to.deep.equal({a: 1, b: 2, c: 3, sum: 0})
      const {a, b, c} = state
      return a + b + c
    }

    const eventMap = [['sum', allowEventType('sum'), computeSum]]

    const stateOne = createNextState(eventMap, initialState, [], 'sum', true)
    expect(stateOne).to.deep.equal({a: 1, b: 2, c: 3, sum: 6})
  })

  it('create next state for simple (flat) event map', () => {
    const {initialState, eventMap} = flatFixtures()

    const stateOne = createNextState(eventMap, initialState, [], 'initialize', true)
    expect(stateOne).to.deep.equal({initialized: true, numTimesRefreshed: 0})

    const stateTwo = createNextState(eventMap, stateOne, [], 'refresh', 0)
    expect(stateTwo).to.deep.equal({initialized: true, numTimesRefreshed: 1})

    const stateThree = createNextState(eventMap, stateTwo, [], 'refresh', 1)
    expect(stateThree).to.deep.equal({initialized: true, numTimesRefreshed: 2})
  })

  it('create next state for one level deep event map', () => {
    const {initialState, eventMap} = oneLevelDeepFixtures()

    const stateOne = createNextState(eventMap, initialState, [], 'initialize', true)
    expect(stateOne).to.deep.equal({initialized: true, user: {name: null, age: null}})

    const stateTwo = createNextState(eventMap, stateOne, [], 'updateName', 'Malika')
    expect(stateTwo).to.deep.equal({initialized: true, user: {name: 'Malika', age: null}})

    const stateThree = createNextState(eventMap, stateTwo, [], 'updateAge', 30)
    expect(stateThree).to.deep.equal({initialized: true, user: {name: 'Malika', age: 30}})
  })

  it('create next state for two level deep event map', () => {
    const {initialState, eventMap} = twoLevelDeepFixtures()

    const stateOne = createNextState(eventMap, initialState, [], 'initialize', true)
    expect(stateOne).to.deep.equal({initialized: true, user: {name: {firstName: null, lastName: null}, age: null}})

    const stateTwo = createNextState(eventMap, stateOne, [], 'updateFirstName', 'Malika')
    expect(stateTwo).to.deep.equal({initialized: true, user: {name: {firstName: 'Malika', lastName: null}, age: null}})

    const stateThree = createNextState(eventMap, stateTwo, [], 'updateLastName', 'Favre')
    expect(stateThree).to.deep.equal({
      initialized: true,
      user: {name: {firstName: 'Malika', lastName: 'Favre'}, age: null},
    })

    const stateFour = createNextState(eventMap, stateThree, [], 'updateAge', 30)
    expect(stateFour).to.deep.equal({
      initialized: true,
      user: {name: {firstName: 'Malika', lastName: 'Favre'}, age: 30},
    })
  })

  // it('allow nested maps', () => {
  //   const addPerson = ({person}) => person
  //   const addPet = ({pet}) => pet
  //   const normalizeByPersonName = ({person}) => person.name.toLowerCase()
  //   const normalizeByPetName = ({pet}) => pet.name.toLowerCase()

  //   const personsPetsMap = [[normalizeByPetName, allowEventType('addPet'), addPet]]
  //   const personsEventMap = [
  //     [normalizeByPersonName, allowEventType('addPerson'), addPerson],
  //     // [normalizeByPersonName, true, personsPetsMap],
  //   ]

  //   const eventMap = [['persons', true, personsEventMap]]
  //   // const store = createStore(eventMap, createPersonsStateFixture())
  //   const initialState = createPersonsStateFixture()
  //   const stateOne = createNextState(eventMap, initialState, [normalizeByPersonName], 'addPerson', {
  //     person: createPerson('Alice'),
  //   })

  //   expect(stateOne).to.deep.equal({
  //     persons: {
  //       alice: createPerson('Alice'),
  //     },
  //   })

  //   // store.dispatch({type: 'addPerson', payload: {person: createPerson('Alice')}})
  //   // store.dispatch({type: 'addPerson', payload: {person: createPerson('Bob')}})
  //   // store.dispatch({type: 'addPerson', payload: {person: createPerson('Clare')}})

  //   // expect(store.state).to.deep.equal({
  //   // persons: {
  //   // alice: createPerson('Alice'),
  //   // bob: createPerson('Bob'),
  //   // clare: createPerson('Clare'),
  //   // },
  //   // })
  // })
})
