
const setState = (state, key, value) => Object.assign({}, state, {[key]: value});

const evaluateGuard = (guard, event) => {
  const isGuardFunction = typeof guard === 'function';
  const isGuardBoolean = typeof guard === 'boolean';

  if (isGuardBoolean) {
    return guard;
  } else if (isGuardFunction) {
    return guard(event);
  }

  throw new Error(
    `Guard can be either a function with signature (event) => Boolean or a Boolean.
     Instead received ${guard}`
  );
}

export const processEventMap = (map, state, event) => map
  .reduce(
    (state, [key, mapper]) => {
      const nextValue = mapper(event, state);
      return setState(state, key, nextValue);
    },
    state
  );

export const createNextState = (eventMap, state) => (event) => {
  const relevantMappers = eventMap
    // Evaluate guards to actual conditions
    .map(([key, guard, mapper]) => [key, evaluateGuard(guard, event), mapper])
    // Filter items that don't satisfy guard
    .filter(([key, predicate, mapper]) => predicate)
    // Remove predicate, since it's not needed any more
    .map(([key, predicate, mapper]) => [key, mapper])
    .map(([key, mapper]) => {
      if (typeof mapper === 'function') {
        return [key, mapper];
      }else if (Array.isArray(mapper)) {
        return [key, createNextState(mapper, state[key])];
      }

      throw new Error(
        `createNextState invalid mapper, mapper can either be a function or array,
        instead received ${mapper}`
      )
    });
    
  return processEventMap(relevantMappers, state, event);
};
