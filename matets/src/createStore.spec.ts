import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'

import {allowEventType} from './utils'
import createStore from './createStore'
import {eventMap, flatEventMapField, deepEventMapField} from './utils'
import {createPersonsStateFixture, createPersonsAndPetStateFixture, createPerson, createPet} from './test.fixtures'
import {EventMap, Transformer} from './datamodel'

const {expect} = chai
chai.use(sinonChai)

const mapInitialization = () => true
const mapAge = (age) => age
const mapFirstName = (firstName) => firstName
const mapLastName = (lastName) => lastName

describe('Store should', () => {
  it('resolve path from payload', () => {
    const addPerson = (person) => person
    const normalizeBy = (field) => (payload) => payload[field].toLowerCase()

    const personsEventMap: EventMap = eventMap(
      deepEventMapField(
        'persons',
        true,
        eventMap(flatEventMapField(normalizeBy('name'), allowEventType('addPerson'), addPerson))
      )
    ) as EventMap

    const store = createStore(personsEventMap, createPersonsStateFixture())

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

    const petsEventMap = eventMap(flatEventMapField(normalizeByPetName, allowEventType('addPet'), addPet))
    const personsEventMap = eventMap(flatEventMapField(normalizeByPersonName, allowEventType('addPerson'), addPerson))
    const personsAndPetsEventMap: EventMap = eventMap(
      deepEventMapField(() => 'pets', true, petsEventMap),
      deepEventMapField(() => 'persons', true, personsEventMap)
    )

    const store = createStore(personsAndPetsEventMap, createPersonsAndPetStateFixture())

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

  it('allow nested maps', () => {
    const addPerson = ({person}) => person
    const addPet = ({pet}) => pet
    const normalizeByPersonName = ({person}) => person.name.toLowerCase()
    const normalizeByPetName = ({pet}) => pet.name.toLowerCase()

    const petsEventMap = eventMap(flatEventMapField(normalizeByPetName, allowEventType('addPet'), addPet))

    const personsEventMap = eventMap(
      flatEventMapField(normalizeByPersonName, allowEventType('addPerson'), addPerson),
      deepEventMapField(
        normalizeByPersonName,
        allowEventType('addPet'),
        eventMap(deepEventMapField('pets', true, petsEventMap))
      )
    )
    const personsAndPetsEventMap = eventMap(deepEventMapField(() => 'persons', true, personsEventMap))

    const store = createStore(personsAndPetsEventMap, createPersonsStateFixture())

    const {person: alice} = store.dispatch({type: 'addPerson', payload: {person: createPerson('Alice')}})
    expect(alice).to.deep.equal({name: 'Alice', pets: {}})
    const {person: bob} = store.dispatch({type: 'addPerson', payload: {person: createPerson('Bob')}})
    expect(bob).to.deep.equal({name: 'Bob', pets: {}})

    const {pet: albi} = store.dispatch({type: 'addPet', payload: {person: alice, pet: createPet('Albi')}})
    expect(albi).to.deep.equal({name: 'Albi'})

    expect(store.state).to.deep.equal({
      persons: {
        alice: {name: 'Alice', pets: {albi: {name: 'Albi'}}},
        bob,
      },
    })
  })
})
