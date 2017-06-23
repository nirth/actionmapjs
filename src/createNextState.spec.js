import chai, {expect} from 'chai';
import dirtyChai from 'dirty-chai';

import {allowEventType} from './utils';
import {createNextState, processEventMap} from './createNextState';

chai.use(dirtyChai);

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

describe('createNextState should', () => {
  it('exist', () => {
    expect(createNextState).to.exist();
    expect(createNextState).to.be.a('function');
  });

  it('traverse flat event map and return a function', () => {
    const {initialState, eventMap} = flatFixtures();

    const stateOne = createNextState(eventMap, initialState)({type: 'initialize', payload: true});
    expect(stateOne).to.deep.equal({initialized: true, numTimesRefreshed: 0});
    
    const stateTwo = createNextState(eventMap, stateOne)({type: 'refresh', payload: 0});
    expect(stateTwo).to.deep.equal({initialized: true, numTimesRefreshed: 1});
    
    const stateThree = createNextState(eventMap, stateTwo)({type: 'refresh', payload: 1});
    expect(stateThree).to.deep.equal({initialized: true, numTimesRefreshed: 2});
  });

  it('traverse deep event map and next state properly', () => {
    const {initialState, eventMap} = oneLevelDeepFixtures();

    const stateOne = createNextState(eventMap, initialState)({type: 'initialize', payload: true});
    expect(stateOne).to.deep.equal({initialized: true, user: {name: null, age: null}});

    const stateTwo = createNextState(eventMap, stateOne)({type: 'updateName', payload: 'Malika'});
    expect(stateTwo).to.deep.equal({initialized: true, user: {name: 'Malika', age: null}});

    const stateThree = createNextState(eventMap, stateTwo)({type: 'updateAge', payload: 30});
    expect(stateThree).to.deep.equal({initialized: true, user: {name: 'Malika', age: 30}});
  });
});

