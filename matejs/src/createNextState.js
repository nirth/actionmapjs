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

const isDefined = (value) => value !== undefined && value !== null

const getState = (state: State, path: PathItem): State => {
  const result = state[path]
  return result
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

  throw new Error(`
    [internal] evaluateGuard
    Guard can either be a boolean or function (event) => Boolean, instead received:
    guard: ${String(guard)} typeof "${typeof guard}"
    event.type: ${event.type} typeof "${typeof event.type}"
    event.payload: ${JSON.stringify(event.payload)}
  `)
}

const computeNextState = (event: Event) => (state, [path, transformer]: PathTransformerPair): State => {
  const {payload} = event
  const previousValue: Value = getState(state, path)
  const nextValue: Value = transformer(payload, previousValue, state)
  const nextState: State = setState(state, path, nextValue)
  return nextState
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

const filterItemsByGuard = (event: Event) => (mapItem: EventMapItem) => {
  const [_, guard] = mapItem
  if (Array.isArray(mapItem) && mapItem.length > 1) {
    return evaluateGuard(guard, event)
  }

  throw new Error(`
    [internal] filterItemsByGuard
    Invalid mapItem, expected list with signature [PathItem, Guard, Transformer],
    instead received:

    mapItem: ${JSON.stringify(mapItem)}, typeof: "${typeof mapItem}"
    mapItem[0]: ${JSON.stringify(mapItem[0])}, typeof: "${typeof mapItem[0]}"
    mapItem[1]: ${JSON.stringify(mapItem[1])}, typeof: "${typeof mapItem[1]}"
    mapItem[2]: ${JSON.stringify(mapItem[2])}, typeof: "${typeof mapItem[2]}"

  `)
}

const resolveEventMapItem = (eventMap: EventMap, state: State, eventType: EventType) => ([
  path,
  _,
  transformer,
]: EventMapItem) => {
  if (typeof transformer === 'function') {
    return [path, transformer]
  } else if (Array.isArray(transformer)) {
    return [path, _createNextState(transformer, state[path], eventType)]
  }

  throw new Error(`
    [internal] resolveEventMapItem
    Something went wrong, this path shouldn‘t be taken. Run the code in debug mode
    path: "${String(path)}" typeof: "${typeof path}"
    event.type: "${String(event.type)}" typeof: "${typeof event.type}"
    transformer: "${String(transformer)}" typeof: "${typeof transformer}"
    state: ${JSON.stringify(state)}
  `)
}

const _createNextState = (eventMap: EventMap, state: State, eventType: EventType) => (payload: Payload): State => {
  if (Array.isArray(eventMap)) {
    const event: Event = {type: eventType, payload}
    const filteredByGuardMapItems = eventMap.filter(filterItemsByGuard(event))
    const transformedMapItems = filteredByGuardMapItems.map(resolveEventMapItem(eventMap, state, eventType))

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
): State => _createNextState(eventMap, state, eventType)(payload)

export default createNextState
