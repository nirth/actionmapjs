import chai, {expect} from 'chai';
import dirtyChai from 'dirty-chai';

import {allowEventType} from './utils';
import {traverseEventMap, processEventMap} from './traverseEventMap';

chai.use(dirtyChai);

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



const flatFixtures = () => ({
  initialState: {
    initialized: false,
    numTimesRefreshed: 0,
  },
  eventMap: [
    ['initialized', allowEventType('initialize'), () => true],
    ['numTimesRefreshed', allowEventType('refresh'), ({payload: prev}) => prev + 1],
  ],
});

const oneLevelDeepFixtures = () => ({
  initialState: {
    initialized: false,
    user: {
      name: null,
      age: null,
    }
  },
  eventMap: [
    ['initialized', allowEventType('initialize'), () => true],
    ['user', true, [
      ['name', allowEventType('updateName'), ({payload}) => payload],
      ['age', allowEventType('updateAge'), ({payload}) => payload],
    ]],
  ],
});

describe('traverseEventMap should', () => {
  it('exist', () => {
    expect(traverseEventMap).to.exist();
    expect(traverseEventMap).to.be.a('function');
  });

  it('', () => {
    const {initialState, eventMap} = flatFixtures();
    const initMap = [['initialized', () => true]];
    const refreshMap = [['numTimesRefreshed', ({payload: prev}) => prev + 1]];

    const stateInitializedTrue = processEventMap(initMap, initialState, {payload: true});
    expect(stateInitializedTrue).to.deep.equal({initialized: true, numTimesRefreshed: 0});
  });

  it('', () => {
    const {initialState, eventMap} = flatFixtures();
    const initMap = [['initialized', () => true]];
    const refreshMap = [['numTimesRefreshed', ({payload: prev}) => prev + 1]];

    const stateInitializedTrue = processEventMap(initMap, initialState, {payload: true});
    expect(stateInitializedTrue).to.deep.equal({initialized: true, numTimesRefreshed: 0});
    
    const stateRefreshedOnce = processEventMap(refreshMap, stateInitializedTrue, {payload: 0});
    expect(stateRefreshedOnce).to.deep.equal({initialized: true, numTimesRefreshed: 1});
    
    const stateRefreshedTwice = processEventMap(refreshMap, stateInitializedTrue, {payload: 1});
    expect(stateRefreshedTwice).to.deep.equal({initialized: true, numTimesRefreshed: 2});
  });

  it('traverse flat event map and return a function', () => {
    const {initialState, eventMap} = flatFixtures();

    const createNextState = (eventMap, state, event) => {
      const relevantMappers = eventMap
        // Evaluate guards to actual conditions
        .map(([key, guard, mapper]) => [key, evaluateGuard(guard, event), mapper])
        // Filter items that don't satisfy guard
        .filter(([key, predicate, mapper]) => predicate)
        // Remove predicate, since it's not needed any more
        .map(([key, predicate, mapper]) => [key, mapper]);
        // .reduce(())

      return processEventMap(relevantMappers, state, event);
    };

    const stateOne = createNextState(eventMap, initialState, {type: 'initialize', payload: true});
    expect(stateOne).to.deep.equal({initialized: true, numTimesRefreshed: 0});
    
    const stateTwo = createNextState(eventMap, stateOne, {type: 'refresh', payload: 0});
    expect(stateTwo).to.deep.equal({initialized: true, numTimesRefreshed: 1});
    
    const stateThree = createNextState(eventMap, stateTwo, {type: 'refresh', payload: 1});
    expect(stateThree).to.deep.equal({initialized: true, numTimesRefreshed: 2});
  });

  it('traverse deep event map and next state properly', () => {
    const {initialState, eventMap} = oneLevelDeepFixtures();

    const createNextState = (eventMap, state) => (event) => {
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

    const stateOne = createNextState(eventMap, initialState)({type: 'initialize', payload: true});
    expect(stateOne).to.deep.equal({initialized: true, user: {name: null, age: null}});

    const stateTwo = createNextState(eventMap, stateOne)({type: 'updateName', payload: 'Malika'});
    expect(stateTwo).to.deep.equal({initialized: true, user: {name: 'Malika', age: null}});

    const stateThree = createNextState(eventMap, stateTwo)({type: 'updateAge', payload: 30});
    expect(stateThree).to.deep.equal({initialized: true, user: {name: 'Malika', age: 30}});
  });
});

