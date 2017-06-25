
import {List} from 'immutable';
import {Observable} from 'rxjs';
import {createNextState} from './createNextState';

const initializeObserver = () => {
  let _observer = null;
  Observable.create((observer) => {
    _observer = observer;
  });

  return _observer;
};

class Store {
  constructor(eventMap, state) {
    // this.observer = initializeObserver();
    // this.observer = observer;
    this.history = List.of(state);
    this.eventMap = eventMap;
  }

  dispatch(event) {
    const previousState = this.state;
    const eventMap = this.eventMap;

    const nextState = createNextState(eventMap, previousState, [], event);

    this.pushState(nextState);
  
    // observer.onNext(nextState);

    // Do I really need it? Handy in testing, but doesn't seem all that useful otherwise.
    return Promise.resolve(nextState);
    // return nextState;
  }

  // subscribe(onNext) {
  //   observer.subscribe(onNext, this.onError, this.onCompleted);
  // }

  // onError(error) {
  //   console.error(`Store, something went wront: ${error}`);
  // }

  // onCompleted() {
  //   console.debug('Store completed for some reason');
  // }

  pushState(state) {
    this.history = this.history.push(state);
  }

  get state() {
    return this.history.last();
  }
}

export const createStore = (initialState, eventMap) => {
  return new Store(initialState, eventMap);
};