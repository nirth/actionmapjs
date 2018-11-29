// @flow
import {compose} from 'ramda'
import type {
  Guard,
  GuardFunction,
  Transformer,
  Event,
  EventType,
  EventMap,
  EventMapItem,
  PathItem,
  Payload,
  Value,
  State,
} from './types'

type PathTransformerPair = [PathItem, Transformer]

const getState = (state: State, path: PathItem): State => {
  return state[path]
}

const setState = (state: State, path: PathItem, value: Value): State => {
  return Object.assign({}, state, {[path]: value})
}

const evaluateGuard = (guard: Guard, event: Event): boolean => {
  // throw new Error('Crashed?')
  if (typeof guard === 'boolean') {
    return guard
  } else if (typeof guard === 'function') {
    return guard(event)
  }

  throw new Error(
    `Guard can be either a function with signature (event) => Boolean or a Boolean.
     guard: ${String(guard)}
     event.type: ${event.type}
     event.payload: ${JSON.stringify(event.payload)} 
    `
  )
}

const computeNextState = (event: Event) => (state, [path, transformer]: PathTransformerPair): State => {
  const {payload} = event
  const computedPath = typeof path === 'function' ? path(payload) : path
  const computedPathValid = typeof computedPath === 'string' && computedPath.length > 0
  const stateValid = state !== null && state !== undefined

  if (computedPathValid && stateValid) {
    const previousValue: Value = getState(state, computedPath)
    const nextValue: Value = transformer(payload, previousValue, state)
    const nextState: State = setState(state, computedPath, nextValue)
    return nextState
  }

  if (!(typeof computedPath === 'string' && computedPath.length > 0)) {
    throw new Error(`
      [internal] computeNextState
      Problem with computing path. Path have to be specified as a string (if constant),
      or as a function (if has to be resolved / computed every time). The result of
      computation is invalid - it must be non empty string instead computedPath is ${computedPath}.
      
      There are two places to check:
      
       * Make sure that path is of valid type, it must be "string | (payload: Payload) => string",
         instead received ${String(path)}
       * Make sure that payload is what’s expected, received: ${String(payload)}
    `)
  }
}

export const processEventMap = (pathAndTransformers: PathTransformerPair[], state: State, event: Event): State => {
  if (state === null || state === undefined) {
    throw new Error(`
      [internal] processEventMap
      
      Unable to retrieve valid state:
       path: ${pathAndTransformers.join(', ')}
       state: ${String(state)}
       
       This error means that field "${String(pathAndTransformers)}" doesn't exist on state "${String(state)}"
       which is likely undefined or null. Make sure that states for the preceeding path exist
       in the initial state and prevous state.
    `)
  }

  return pathAndTransformers.reduce(computeNextState(event), state)
}

const filterItemsByGuard = (event: Event) => ([_, guard]: EventMapItem) => {
  return evaluateGuard(guard, event)
}

const resolveEventMapItem = (eventMap: EventMap, state: State, currentPath: PathItem[], eventType: EventType) => ([
  path,
  _,
  transformer,
]: EventMapItem) => {
  console.log('validateAndComputePathTransformerPair')
  if (typeof transformer === 'function') {
    return [path, transformer]
  } else if (Array.isArray(transformer)) {
    return [path, _createNextState(transformer, state[path], currentPath.concat([path]), eventType)]
  }

  throw new Error(`
    [internal] validateAndComputePathTransformerPair
    Something went wrong, this path shouldn‘t be taken. Run the code in debug mode
    currentPath: ${Array.isArray(currentPath) ? currentPath.join(',') : 'Not an Array'}
    eventType: ${eventType}
    path: ${path}
    transformer: ${transformer}
  `)
}

const _createNextState = (eventMap: EventMap, state: State, path: PathItem, eventType: EventType) => (
  payload: Payload
): State => {
  if (Array.isArray(eventMap)) {
    const event: Event = {type: eventType, payload}
    const filteredByGuardMapItems = eventMap.filter(filterItemsByGuard(event))
    console.log('_createNextState:path', path)
    const transformedMapItems = filteredByGuardMapItems.map(resolveEventMapItem(eventMap, state, path, eventType))

    return processEventMap(transformedMapItems, state, event)
  }

  throw new Error(`
    [internal] _createNextState

    Something is wrong
  `)
}

const createNextState = (
  eventMap: EventMap,
  state: State,
  path: PathItem,
  eventType: EventType,
  payload: Payload
): State => _createNextState(eventMap, state, path, eventType)(payload)

export default createNextState
