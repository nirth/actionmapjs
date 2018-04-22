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

export const processEventMap = (map: KeyTransformerPair[], state: State, event: Event) =>
  map.reduce((nextState: State, [key, transformer]: KeyTransformerPair) => {
    const previousSubState = getState(nextState, key)
    const nextSubState = transformer(event, nextState, previousSubState)
    return setState(nextState, key, nextSubState)
  }, state)

//
const _createNextState = (eventMap: EventMap, state: State, path: string[]) => (event: Event): State => {
  const relevantTransformers: KeyTransformerPair[] = eventMap
    // Evaluate guards to actual conditions
    .map(([key: string, guard: Guard, transformer: Transformer]) => [key, evaluateGuard(guard, event), transformer])
    // Filter items that don't satisfy guard
    .filter(([key: string, predicate: boolean, transformer: Transformer]) => predicate)
    // Remove predicate, since it's not needed any more
    .map(([key: string, predicate: boolean, transformer: Transformer]) => [key, transformer])
    .map(([key, transformer]: KeyTransformerPair) => {
      if (state === null || state === undefined) {
        throw new Error(`matejs::_createNewState: Invalid State: ${String(state)}`)
      }

      if (typeof transformer === 'function') {
        return [key, transformer]
      } else if (Array.isArray(transformer)) {
        return [key, _createNextState(transformer, state[key], path.concat([key]))]
      }

      // This sounds like an ineternal error. Maybe instead of doing this checks,
      // I should run event map through a validation.
      throw new Error(
        `matejs::_createNewState: invalid transformer, transformer can either be a function or array,
        instead received ${transformer}`
      )
    })

  return processEventMap(relevantTransformers, state, event)
}

export const createNextState = (eventMap: EventMap, state: State, path: string[], event: Event): State =>
  _createNextState(eventMap, state, path)(event)
