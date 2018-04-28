// @flow

import type {Guard, GuardFunction, Transformer, Event, EventMap, EventMapItem, State} from './types'

const getState = (state: State, key: string): State => {
  if (state === null || state === undefined) {
    throw new Error(`matejs::_createNewState: Invalid State: ${String(state)}`)
  }

  return state[key]
}
const setState = (state: State, key: string, value: ?Object): State => Object.assign({}, state, {[key]: value})

const evaluateGuard = (guard: Guard, event: Event): boolean => {
  if (typeof guard === 'boolean') {
    return guard
  } else if (typeof guard === 'function') {
    return guard(event)
  }

  throw new Error(
    `Guard can be either a function with signature (event) => Boolean or a Boolean.
     Instead received ${String(guard)}`
  )
}

type KeyTransformerPair = [string, Transformer]

export const processEventMap = (
  keysAndTransformers: KeyTransformerPair[],
  state: State,
  eventType: EventType,
  payload: Payload
): State => keysAndTransformers.reduce(computeNextState(eventType, payload), state)

const filterItemsByGuard = (eventType, payload) => ([key: string, guard: Guard, transformer: Transformer]): boolean =>
  evaluateGuard(guard, {type: eventType, payload})

const pickKeyAndTransformer = ([key: string, predicate: boolean, transformer: Transformer]): KeyTransformerPair => [
  key,
  transformer,
]

const validateAndComputeKeyTransformerPair = (
  eventMap: EventMap,
  state: State,
  path: string[],
  eventType: EventType
) => ([key, transformer]: KeyTransformerPair) => {
  if (typeof transformer === 'function') {
    return [key, transformer]
  } else if (Array.isArray(transformer)) {
    return [key, _createNextState(transformer, state[key], path.concat([key]), eventType)]
  }

  // This sounds like an ineternal error. Maybe instead of doing this checks,
  // I should run event map through a validation.
  console.error(
    `matejs::_createNextState: Something went wrong, this path shouldn‘t be taken. Run the code in debug mode`
  )
  console.error(`validateAndComputeKeyTransformerPair`, eventMap, state, path, eventType, key, transformer)
  throw new Error(
    `matejs::_createNextState: Something went wrong, this path shouldn‘t be taken. Run the code in debug mode`
  )
}

const _createNextState = (eventMap: EventMap, state: State, path: string[], eventType: EventType) => (
  payload: Payload
): State =>
  processEventMap(
    eventMap
      .filter(filterItemsByGuard(eventType, payload))
      .map(compose(validateAndComputeKeyTransformerPair(eventMap, state, path, eventType), pickKeyAndTransformer)),
    state,
    eventType,
    payload
  )

export const createNextState = (
  eventMap: EventMap,
  state: State,
  path: string[],
  eventType: EventType,
  payload: Payload
): State => _createNextState(eventMap, state, path, eventType)(payload)
