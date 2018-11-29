import chai, {expect} from 'chai'
import dirtyChai from 'dirty-chai'
import sinonChai from 'sinon-chai'
import sinonChaiInOrder from 'sinon-chai-in-order'
import {spy} from 'sinon'

import {allowEventType} from './utils'
import {createStore} from './createStore'
import {createPersonsStateFixture, createPersonsAndPetStateFixture, createPerson, createPet} from './test.fixtures.js'

chai.use(dirtyChai)
chai.use(sinonChai)
chai.use(sinonChaiInOrder)

const mapInitialization = () => true
const mapAge = (age) => age
const mapFirstName = (firstName) => firstName
const mapLastName = (lastName) => lastName

const stateFixture = () => ({
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
    ['initialized', allowEventType('initialize'), mapInitialization],
    [
      'user',
      true,
      [
        [
          'name',
          true,
          [
            ['firstName', allowEventType('updateFirstName'), mapFirstName],
            ['lastName', allowEventType('updateLastName'), mapLastName],
          ],
        ],
        ['age', allowEventType('updateAge'), mapAge],
      ],
    ],
  ],
  events: {
    initialize: () => ({type: 'initialize'}),
    updateFirstName: (firstName) => ({
      type: 'updateFirstName',
      payload: firstName,
    }),
    updateLastName: (lastName) => ({type: 'updateLastName', payload: lastName}),
    updateAge: (age) => ({type: 'updateAge', payload: age}),
  },
})

describe('createStore should', () => {
  it('exist', () => expect(createStore).to.be.a('function'))

  it.only('create new state when dispatched series of events and use appropriate mappers', () => {
    const {
      initialState,
      eventMap,
      events: {initialize, updateFirstName, updateLastName, updateAge},
    } = stateFixture()

    const store = createStore(eventMap, initialState)

    store.dispatch(initialize())
    store.dispatch(updateAge(32))
    store.dispatch(updateFirstName('Malika'))
    store.dispatch(updateLastName('Favre'))
    store.dispatch(updateAge(22))

    const state = store.state

    expect(state).to.deep.equal({
      initialized: true,
      user: {
        name: {
          firstName: 'Malika',
          lastName: 'Favre',
        },
        age: 22,
      },
    })
  })

  it('dispatch new events and allow subscriptions to receive updated state', () => {
    const {
      initialState,
      eventMap,
      events: {initialize, updateFirstName, updateLastName, updateAge},
    } = stateFixture()

    const store = createStore(eventMap, initialState)
    const onNextState = spy()

    store.subscribe(onNextState)
    store.dispatch(initialize())

    store.dispatch(updateAge(32))
    store.dispatch(updateFirstName('Malika'))
    store.dispatch(updateLastName('Favre'))
    store.dispatch(updateAge(22))

    expect(onNextState)
      .inOrder.subsequently.calledWith({
        initialized: true,
        user: {name: {firstName: null, lastName: null}, age: null},
      })
      .subsequently.calledWith({
        initialized: true,
        user: {name: {firstName: null, lastName: null}, age: 32},
      })
      .subsequently.calledWith({
        initialized: true,
        user: {name: {firstName: 'Malika', lastName: null}, age: 32},
      })
      .subsequently.calledWith({
        initialized: true,
        user: {name: {firstName: 'Malika', lastName: 'Favre'}, age: 32},
      })
      .subsequently.calledWith({
        initialized: true,
        user: {name: {firstName: 'Malika', lastName: 'Favre'}, age: 22},
      })
  })

  it('able to detect invalid event type in develop mode', () => {
    const {
      initialState,
      eventMap,
      events: {initialize, updateFirstName, updateLastName, updateAge},
    } = stateFixture()

    const store = createStore(eventMap, initialState, [], {developmentMode: true})

    expect(() => store.dispatch(null)).to.throw()
    expect(() => store.dispatch({})).to.throw()
    expect(() => store.dispatch({name: 'foo'})).to.throw()
    expect(() => store.dispatch({type: 'foobar'})).not.to.throw()
  })

  it('dispatch new events and allow subscribers to unsubscribe', () => {
    const {
      initialState,
      eventMap,
      events: {initialize, updateFirstName, updateLastName, updateAge},
    } = stateFixture()

    const store = createStore(eventMap, initialState)
    const onNextState = spy()

    const subscription = store.subscribe(onNextState)
    store.dispatch(initialize())

    store.dispatch(updateAge(32))
    store.dispatch(updateFirstName('Malika'))

    subscription.unsubscribe()

    store.dispatch(updateLastName('Favre'))
    store.dispatch(updateAge(22))

    expect(onNextState)
      .inOrder.subsequently.calledWith({
        initialized: true,
        user: {name: {firstName: null, lastName: null}, age: null},
      })
      .subsequently.calledWith({
        initialized: true,
        user: {name: {firstName: null, lastName: null}, age: 32},
      })
      .subsequently.not.called()
  })
})

describe('Store should', () => {
  it('resolve path from payload', () => {
    const addPerson = (person) => person
    const normalizeBy = (field) => (payload) => payload[field].toLowerCase()
    const eventMap = [['persons', true, [[normalizeBy('name'), allowEventType('addPerson'), addPerson]]]]

    const store = createStore(eventMap, createPersonsStateFixture())

    store.dispatch({type: 'addPerson', payload: createPerson('Alice')})
    store.dispatch({type: 'addPerson', payload: createPerson('Bob')})
    store.dispatch({type: 'addPerson', payload: createPerson('Clare')})

    expect(store.state.persons).to.deep.equal({
      alice: createPerson('Alice'),
      bob: createPerson('Bob'),
      clare: createPerson('Clare'),
    })
  })

  it('return payload as a result of dispatch', () => {
    const addPerson = ({person}) => person
    const addPet = ({pet}) => pet
    const normalizeByPersonName = ({person}) => person.name.toLowerCase()
    const normalizeByPetName = ({pet}) => pet.name.toLowerCase()

    const petsEventMap = [[normalizeByPetName, allowEventType('addPet'), addPet]]
    const personsEventMap = [[normalizeByPersonName, allowEventType('addPerson'), addPerson]]
    const eventMap = [['pets', true, petsEventMap], ['persons', true, personsEventMap]]
    const store = createStore(eventMap, createPersonsAndPetStateFixture())

    const {person: alice} = store.dispatch({type: 'addPerson', payload: {person: createPerson('Alice')}})
    expect(alice).to.deep.equal({name: 'Alice', pets: {}})
    const {person: bob} = store.dispatch({type: 'addPerson', payload: {person: createPerson('Bob')}})
    expect(bob).to.deep.equal({name: 'Bob', pets: {}})

    const {pet: albi} = store.dispatch({type: 'addPet', payload: {pet: createPet('Albi')}})
    expect(albi).to.deep.equal({name: 'Albi'})

    expect(store.state).to.deep.equal({
      persons: {
        alice: {name: 'Alice', pets: {}},
        bob: {name: 'Bob', pets: {}},
      },
      pets: {
        albi: {name: 'Albi'},
      },
    })

    expect(store.state).to.deep.equal({
      persons: {
        alice,
        bob,
      },
      pets: {
        albi,
      },
    })
  })

  xit('allow nested maps', () => {
    const addPerson = ({person}) => person
    const addPet = ({pet}) => pet
    const normalizeByPersonName = ({person}) => person.name.toLowerCase()
    const normalizeByPetName = ({pet}) => pet.name.toLowerCase()

    const petsEventMap = [[normalizeByPetName, allowEventType('addPet'), addPet]]
    const personsEventMap = [
      [normalizeByPersonName, allowEventType('addPerson'), addPerson],
      ['pets', true, petsEventMap],
    ]
    const eventMap = [['persons', true, personsEventMap]]
    const store = createStore(eventMap, createPersonsAndPetStateFixture())

    const {person: alice} = store.dispatch({type: 'addPerson', payload: {person: createPerson('Alice')}})
    expect(alice).to.deep.equal({name: 'Alice', pets: {}})
    const {person: bob} = store.dispatch({type: 'addPerson', payload: {person: createPerson('Bob')}})
    expect(bob).to.deep.equal({name: 'Bob', pets: {}})

    const {pet: albi} = store.dispatch({type: 'addPet', payload: {pet: createPet('Albi')}})
    expect(albi).to.deep.equal({name: 'Albi'})

    expect(store.state).to.deep.equal({
      persons: {
        alice: {name: 'Alice', pets: {albi: {name: 'Albi'}}},
        bob: {name: 'Bob', pets: {}},
      },
    })

    expect(store.state).to.deep.equal({
      persons: {
        alice: {name: 'Alice', pets: {albi}},
        bob,
      },
    })
  })

  xit('XXX allow nested maps', () => {
    const addPerson = ({person}) => person
    const addPet = ({pet}) => pet
    const normalizeByPerson = spy(({person}) => (person && person.name ? person.name.toLowerCase() : 'unknown'))
    const normalizeByPetName = spy(({pet}) => (pet && pet.name ? pet.name.toLowerCase() : 'unknown'))

    const personsPetsMap = [[normalizeByPetName, allowEventType('addPet'), addPet]]

    const personsEventMap = [
      [normalizeByPerson, allowEventType('addPerson'), addPerson],
      [normalizeByPerson, allowEventType('addPet'), ['pets', true, personsPetsMap]],
    ]

    const eventMap = [['persons', true, personsEventMap]]

    const store = createStore(eventMap, createPersonsStateFixture())

    const alice = store.dispatch({type: 'addPerson', payload: {person: createPerson('Alice')}})
    expect(normalizeByPerson).calledOnce()
    expect(normalizeByPetName).not.to.have.been.called()
    const bob = store.dispatch({type: 'addPerson', payload: {person: createPerson('Bob')}})
    expect(normalizeByPerson).calledTwice()
    expect(normalizeByPetName).not.to.have.been.called()
    const clare = store.dispatch({type: 'addPerson', payload: {person: createPerson('Clare')}})
    expect(normalizeByPerson).calledThrice()
    expect(normalizeByPetName).not.to.have.been.called()

    const albi = store.dispatch({type: 'addPet', payload: {person: alice, pet: createPet('Albi')}})
    expect(normalizeByPetName).calledOnce()
    expect(normalizeByPetName).calledWith({person: {name: 'Alice'}, pet: {name: 'Albi'}})
    const bobik = store.dispatch({type: 'addPet', payload: {person: bob, pet: createPet('Bobik')}})
    expect(normalizeByPetName).calledThrice()
    const candi = store.dispatch({type: 'addPet', payload: {person: clare, pet: createPet('Candi')}})
    expect(normalizeByPetName).calledTwice()

    // expect(store.state).to.deep.equal({
    //   persons: {
    //     alice: {
    //       name: 'Alice',
    //       pets: {
    //         albi: {name: 'Albi'},
    //       },
    //     },
    //     bob: {
    //       name: 'Bob',
    //       pets: {
    //         bobik: {name: 'Bobik'},
    //       },
    //     },
    //     clare: {
    //       name: 'Clare',
    //       pets: {
    //         candi: {name: 'Candi'},
    //       },
    //     },
    //   },
    // })
  })
})
