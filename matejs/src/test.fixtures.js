// @flow

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
