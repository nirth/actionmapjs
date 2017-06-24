
import {createNextStore} from './createNextStore';

class Store {
  constructor(state, eventMap) {
    this.history = [state];
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
    return this.history
  }
}

export const createStore = (initialState, eventMap) => {
  return new Store(initialState, eventMap);
};