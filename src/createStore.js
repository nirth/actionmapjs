import {List, Map} from 'immutable';

export const filterRelevantMappers = (state, eventMap, event) => eventMap
  .map(({key, guard, mapper}) => {
    const isGuardFunction = typeof guard === 'function';
    const shouldExecute = isGuardFunction ? guard(event) : guard;
    return [key, shouldExecute, mapper];
  })
  .filter(([key, predicate, mapper]) => predicate)
  .map(([key, predicate, mapper]) => [key, mapper]);

export const applyTransformations = (previousState, mappers, event) => {
  mappers.reduce(
    (state, [key, mapper]) => {
      const previousValue = state.get(key)
    }
  )
}

class Store {
  constructor(state, eventMap) {
    this.history = List.of(Map(state));
    this.eventMap = eventMap;
  }

  dispatch(event) {
    const t = Date.now();
    const previousState = this.state;
    const eventMap = this.eventMap;

    const relevantMappers = filterRelevantMappers(previousState, eventMap, event);
    const nextState = relevantMappers.reduce(
      (state, [key, mapper]) => {
        if (typeof mapper === 'function') {
          return state.set(key, mapper(event.payload, event, state));
        }

        return state;
      },
      previousState
    );

    this.pushState(nextState);
    console.log('Time:', Date.now() - t);
  }

  pushState(state) {
    this.history = this.history.push(state);
    return this.history;
  }

  get state() {
    return this.history.last();
  }
}

export const createStore = (initialState, eventMap) => {
  return new Store(initialState, eventMap);
};