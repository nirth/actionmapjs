
import {allowEventType, createStore} from '../src';

console.log('allowEventType:works', allowEventType('type1')({type: 'type1'}));

const addOne = (current) => {
  console.log('add one to', current);
  return current + 1;
};

const addTwo = (current) => {
  console.log('add two to', current);
  return current + 2;
};

const justAdd = (a, b) => {
  console.log('just add', a, b);
  return a + b;
};

const initialState = {
  counter: 0,
  frame: 0,
};

const eventMap = [
  {key: 'counter', guard: allowEventType('one'), mapper: addOne},
  {key: 'counter', guard: allowEventType('two'), mapper: addTwo},
  {key: 'counter', guard: allowEventType('add'), mapper: justAdd},
];

const store = createStore(initialState, eventMap);

store.dispatch({type: 'one'})
store.dispatch({type: 'one'});
store.dispatch({type: 'two'});
store.dispatch({type: 'one'});
store.dispatch({type: 'add', payload: 3});

console.log(store.getState());
