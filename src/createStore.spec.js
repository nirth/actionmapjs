import chai, {expect} from 'chai'
import dirtyChai from 'dirty-chai'
import sinonChai from 'sinon-chai'
import sinonChaiInOrder from 'sinon-chai-in-order'
import {spy} from 'sinon'

import {allowEventType} from './utils';
import {createStore} from './createStore';

chai.use(dirtyChai)
chai.use(sinonChai)
chai.use(sinonChaiInOrder)

const mapInitialization = () => true;
const mapAge = ({payload: age}) => age;
const mapFirstName = ({payload: firstName}) => firstName;
const mapLastName = ({payload: lastName}) => lastName;

const stateFixture = () => ({
  initialState: {
    initialized: false,
    user: {
      name: {
        firstName: null,
        lastName: null,
      },
      age: null,
    },
  },
  eventMap: [
    ['initialized', allowEventType('initialize'), mapInitialization],
    ['user', true, [
      ['name', true, [
        ['firstName', allowEventType('updateFirstName'), mapFirstName],
        ['lastName', allowEventType('updateLastName'), mapLastName],
      ]],
      ['age', allowEventType('updateAge'), mapAge],
    ]],
  ],
  events: {
    initialize: () => ({type: 'initialize'}),
    updateFirstName: (firstName) => ({type: 'updateFirstName', payload: firstName}),
    updateLastName: (lastName) => ({type: 'updateLastName', payload: lastName}),
    updateAge: (age) => ({type: 'updateAge', payload: age}),
  }
});

describe('createStore should', () => {
  it('exist', () => expect(createStore).to.be.a('function'));

  it('create new state when dispatched series of events and use appropriate mappers', () => {
    const {initialState, eventMap, events: {
      initialize,
      updateFirstName,
      updateLastName,
      updateAge,
    }} = stateFixture()

    const store = createStore(eventMap, initialState)

    store.dispatch(initialize())
    store.dispatch(updateAge(32))
    store.dispatch(updateFirstName('Malika'))
    store.dispatch(updateLastName('Favre'))
    store.dispatch(updateAge(22))

    const state = store.state;

    expect(state).to.deep.equal({
      initialized: true,
      user: {
        name: {
          firstName: 'Malika',
          lastName: 'Favre',
        },
        age: 22,
      },
    })
  })

  it('dispatch new events and allow subscriptions to receive updated state', () => {
    const {initialState, eventMap, events: {
      initialize,
      updateFirstName,
      updateLastName,
      updateAge,
    }} = stateFixture()

    const store = createStore(eventMap, initialState)
    const onNextState = spy()

    store.subscribe(onNextState)
    store.dispatch(initialize())

    store.dispatch(updateAge(32))
    store.dispatch(updateFirstName('Malika'))
    store.dispatch(updateLastName('Favre'))
    store.dispatch(updateAge(22))

    expect(onNextState).inOrder
      .subsequently.calledWith({
        initialized: true,
        user: {name: {firstName: null, lastName: null}, age: null},
      })
      .subsequently.calledWith({
        initialized: true,
        user: {name: {firstName: null, lastName: null}, age: 32},
      })
      .subsequently.calledWith({
        initialized: true,
        user: {name: {firstName: 'Malika', lastName: null}, age: 32},
      })
      .subsequently.calledWith({
        initialized: true,
        user: {name: {firstName: 'Malika', lastName: 'Favre'}, age: 32},
      })
      .subsequently.calledWith({
        initialized: true,
        user: {name: {firstName: 'Malika', lastName: 'Favre'}, age: 22},
      })
  })

  it('dispatch new events and allow subscribers to unsubscribe', () => {
    const {initialState, eventMap, events: {
      initialize,
      updateFirstName,
      updateLastName,
      updateAge,
    }} = stateFixture()

    const store = createStore(eventMap, initialState)
    const onNextState = spy()

    const subscription = store.subscribe(onNextState)
    store.dispatch(initialize())

    store.dispatch(updateAge(32))
    store.dispatch(updateFirstName('Malika'))
    
    subscription.unsubscribe()

    store.dispatch(updateLastName('Favre'))
    store.dispatch(updateAge(22))

    // Expecting event handler to only be called twice,
    // we are dispatch three events, but unsubscribing after second.
    expect(onNextState).inOrder
      .subsequently.calledWith({initialized: true, user: {name: {firstName: null, lastName: null}, age: null}})
      .subsequently.calledWith({initialized: true, user: {name: {firstName: null, lastName: null}, age: 32}})
      .subsequently.not.called()
  })
});
