
import {allowEventType, simpleEventFactory, createStore} from '../src';

console.log('allowEventType:works', allowEventType('type1')({type: 'type1'}));

const initEvent = simpleEventFactory('init');
const updateUserNameEvent = simpleEventFactory('updateName');
const updateUserAgeEvent = simpleEventFactory('updateAge');

const initialize = () => true;
const updateUserName = (name) => name;
const updateUserAge = (age) => age;

const initialState = {
  initialized: false,
  user: {
    name: null,
    age: null,
  },
};

const userEventMap = [
  ['name', allowEventType('updateName'), updateUserName],
  ['name', allowEventType('updateAge'), updateUserAge],
];

const appEventMap = [
  ['initialized', allowEventType('init'), initialize],
  ['user', subMap, userEventMap],
];

const store = createStore(initialState, appEventMap);

store.dispatch(initEvent());

console.log(store.state);
