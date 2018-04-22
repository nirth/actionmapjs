// @flow

import type {Guard, Transformer, Event, EventMap, EventMapItem, State} from './types'

const getState = (state: State, key: string): State => state[key]
const setState = (state: State, key: string, value: ?Object): State => Object.assign({}, state, {[key]: value})

const evaluateGuard = (guard: Guard, event: Event): boolean => {
  const isGuardFunction = typeof guard === 'function'
  const isGuardBoolean = typeof guard === 'boolean'

  if (isGuardBoolean) {
    return guard
  } else if (isGuardFunction) {
    return guard(event)
  }

  throw new Error(
    `Guard can be either a function with signature (event) => Boolean or a Boolean.
     Instead received ${guard}`
  )
}

export const processEventMap = (map, state: State, event: Event) =>
  map.reduce((state, [key, transformer: Transformer]) => {
    const previousSubState = getState(state, key)
    const nextSubState = transformer(event, state, previousSubState)
    return setState(state, key, nextSubState)
  }, state)

//
const _createNextState = (eventMap: EventMap, state: State, path: string) => (event: Event): State => {
  const relevantTransformers = eventMap
    // Evaluate guards to actual conditions
    .map(([key: string, guard: Guard, transformer: Transformer]) => [key, evaluateGuard(guard, event), transformer])
    // Filter items that don't satisfy guard
    .filter(([key: string, predicate: boolean, transformer: Transformer]) => predicate)
    // Remove predicate, since it's not needed any more
    .map(([key: string, predicate: boolean, transformer: Transformer]) => [key, transformer])
    .map(([key: string, transformer: Transformer]) => {
      if (typeof transformer === 'function') {
        return [key, transformer]
      } else if (Array.isArray(transformer)) {
        return [key, _createNextState(transformer, state[key], path.concat([key]))]
      }

      // This sounds like an ineternal error. Maybe instead of doing this checks,
      // I should run event map through a validation.
      throw new Error(
        `createNextState: invalid transformer, transformer can either be a function or array,
        instead received ${transformer}`
      )
    })

  return processEventMap(relevantTransformers, state, event)
}

export const createNextState = (eventMap: EventMap, state: State, path: string, event: Event): State =>
  _createNextState(eventMap, state, path)(event)

// export const createNextState = curry((eventMap, state, path, event) => {

// })
