const getState = (state, key) => state[key]
const setState = (state, key, value) => Object.assign({}, state, {[key]: value})

const evaluateGuard = (guard, event) => {
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

export const processEventMap = (map, state, event) =>
  map.reduce((state, [key, transformer]) => {
    const previousSubState = getState(state, key)
    const nextSubState = transformer(event, state, previousSubState)
    return setState(state, key, nextSubState)
  }, state)

//
const _createNextState = (eventMap, state, path) => (event) => {
  const relevantTransformers = eventMap
    // Evaluate guards to actual conditions
    .map(([key, guard, transformer]) => [key, evaluateGuard(guard, event), transformer])
    // Filter items that don't satisfy guard
    .filter(([key, predicate, transformer]) => predicate)
    // Remove predicate, since it's not needed any more
    .map(([key, predicate, transformer]) => [key, transformer])
    .map(([key, transformer]) => {
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

export const createNextState = (eventMap, state, path, event) => _createNextState(eventMap, state, path)(event)

// export const createNextState = curry((eventMap, state, path, event) => {

// })
