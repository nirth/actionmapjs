import {List, Map} from 'immutable';

export const filterRelevantMappers = (state, eventMap, event) => eventMap
  .map(([key, guard, mapper]) => [key, guard(event), mapper])
  .filter(([key, predicate, mapper]) => predicate)
  .map(([key, predicate, mapper]) => [key, mapper]);

export const createEventMap = (initialState, eventMap) => {
  const state = Map(initialState);
  
  let history = List.of(state);

  const subscriptions = {

  };

  return {
    dispatch(event) {
      const previousState = history.last();
      const relevantMappers = filterRelevantMappers(state, eventMap, event);
      const nextState = relevantMappers.reduce(
        (state, [key, mapper]) => {
          const previousValue = state.get(key);
          const nextValue = mapper(previousValue, event.payload);
          return state.set(key, nextValue);
        },
        previousState
      );

      history = history.push(nextState);
    },

    getState() {
      return history.last();
    }
  }
};