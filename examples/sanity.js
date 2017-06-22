
import {allowEventType, createStore} from '../src';

console.log('allowEventType:works', allowEventType('type1')({type: 'type1'}));

const addOne = (current) => current + 1;

const addTwo = (current) => current + 2;

const justAdd = (a, b) => a + b;

const initialState = {
  counter: 0,
  frame: 0,
};

const eventMap = [
  {key: 'counter', guard: allowEventType('one'), mapper: addOne},
  {key: 'counter', guard: allowEventType('two'), mapper: addTwo},
  {key: 'counter', guard: allowEventType('add'), mapper: justAdd},
  // {key: 'user', mapper: [
  //   {key: 'name', guard: allowEventType('name'), mapper: () => 'new name'},
  //   {key: 'age', guard: allowEventType('age'), mapper: () => 'new age'},
  // ]},
];

const store = createStore(initialState, eventMap);

store.dispatch({type: 'one'})
store.dispatch({type: 'one'});
store.dispatch({type: 'two'});
store.dispatch({type: 'one'});
store.dispatch({type: 'add', payload: 3});

console.log(store.state);
