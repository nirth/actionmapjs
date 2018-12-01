import {allowEventType, eventMap, flatEventMapField, deepEventMapField} from './utils'

const initializeApp = () => true
const updateName = (name) => name
const updateAge = (age) => age
const updateFirstName = (firstName) => firstName
const updateLastName = (lastName) => lastName

const flatEventMap = eventMap(
  flatEventMapField('initialized', allowEventType('initialize'), () => true),
  flatEventMapField('numTimesRefreshed', allowEventType('refresh'), (prev) => prev + 1)
)

const flatInitialState = {
  initialized: false,
  numTimesRefreshed: 0,
}

export const flatFixtures = () => ({
  initialState: JSON.parse(JSON.stringify(flatInitialState)),
  eventMap: flatEventMap,
})

export const originalPersonsStateFixture = {
  persons: {},
}

export const originalPersonsAndPetStateFixture = {
  persons: {},
  pets: {},
}

export const createPersonsStateFixture = () => JSON.parse(JSON.stringify(originalPersonsStateFixture))

export const createPersonsAndPetStateFixture = () => JSON.parse(JSON.stringify(originalPersonsAndPetStateFixture))

export const createPerson = (name: string) => ({name, pets: {}})
export const createPet = (name: string) => ({name})
