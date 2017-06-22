
import {allowEventType, createEventMap} from '../src';

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

const map = [
  ['counter', allowEventType('one'), addOne],
  ['counter', allowEventType('two'), addTwo],
  ['counter', allowEventType('add'), justAdd]
];

const eventMap = createEventMap(initialState, map);

eventMap.dispatch({type: 'one'})
eventMap.dispatch({type: 'one'});
eventMap.dispatch({type: 'two'});
eventMap.dispatch({type: 'one'});
eventMap.dispatch({type: 'add', payload: 3});

console.log(eventMap.getState());
