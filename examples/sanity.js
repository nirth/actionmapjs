
import {allowEventType, simpleEventFactory, createStore} from '../src';

console.log('allowEventType:works', allowEventType('type1')({type: 'type1'}));

const eventOne = simpleEventFactory('one');
const eventTwo = simpleEventFactory('two');

const addOne = (current) => current + 1;

const addTwo = (current) => current + 2;

const justAdd = (b) => a + b;

const updateUserName = (prev, next) => next;
const updateAge = (prev, next) => next;

const initialState = {
  counter: 0,
  frame: 0,
};

const eventMap = [
  {key: 'counter', guard: allowEventType('one'), mapper: addOne},
  {key: 'counter', guard: allowEventType('two'), mapper: addTwo},
  {key: 'counter', guard: allowEventType('add'), mapper: justAdd},
  {key: 'user', guard: true, mapper: [
    {key: 'name', guard: allowEventType('user'), mapper: updateUserName},
    {key: 'age', guard: allowEventType('age'), mapper: updateAge},
  ]}
];

const store = createStore(initialState, eventMap);

store.dispatch(eventOne(store.getState().get('counter')));
store.dispatch(eventOne(store.getState().get('counter')));
store.dispatch(eventOne(store.getState().get('counter')));
// store.dispatch({type: 'one'});
// store.dispatch({type: 'two'});
// store.dispatch({type: 'one'});
// store.dispatch({type: 'add', payload: 3});

console.log(store.state);
