import {
  Event,
  EventMap,
  EventMapField,
  EventType,
  Guard,
  Path,
  Payload,
  ResolvedPath,
  State,
  Transformer,
  Value,
} from './mate'

type PathAndTransformer = [ResolvedPath, Transformer]

const getState = (state: State, path: ResolvedPath): State => {
  const result = state[path]
  return result
}

const setState = (state: State, path: ResolvedPath, value: Value): State => {
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

const computeNextState = (event: Event) => (state, [path, transformer]: PathAndTransformer): State => {
  const {payload} = event
  const previousValue: Value = getState(state, path)
  const nextValue: Value = transformer(payload, previousValue, state)
  const nextState: State = setState(state, path, nextValue)
  return nextState
}

export const processEventMap = (pathAndTransformers: PathAndTransformer[], state: State, event: Event): State => {
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

const filterItemsByGuard = (event: Event) => (mapField: EventMapField) => {
  const {guard} = mapField
  return evaluateGuard(guard, event)
}

const resolveEventMapItem = (state: State, event: Event) => (mapField: EventMapField): PathAndTransformer => {
  const {path, transformer, eventMap} = mapField
  const resolvedPath = typeof path === 'function' ? path(event.payload) : path
  const hasTransformer = typeof transformer === 'function'
  const hasEventMap = typeof eventMap === 'object' && eventMap !== null

  if (hasTransformer) {
    return [resolvedPath, transformer as Transformer]
  } else if (hasEventMap) {
    return [resolvedPath, internalCreateNextState(eventMap as EventMap, state[resolvedPath], event.type)]
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

const internalCreateNextState = (eventMap: EventMap, state: State, eventType: EventType): Transformer => (
  payload: Payload
): State => {
  if (Array.isArray(eventMap)) {
    const event: Event = {type: eventType, payload}
    const filteredByGuardMapItems: EventMap = eventMap.filter(filterItemsByGuard(event))
    const transformedMapItems = filteredByGuardMapItems.map(resolveEventMapItem(state, event))

    return processEventMap(transformedMapItems, state, event)
  }

  throw new Error(`
    [internal] _createNextState

    Something is wrong
  `)
}

const createNextState = (eventMap: EventMap, state: State, eventType: EventType, payload: Payload): State =>
  internalCreateNextState(eventMap, state, eventType)(payload)

export default createNextState
