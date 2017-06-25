import {createStore, allowEventType} from '../src'

const mapCount = ({payload}) => payload + 1;

const traceCurrentCount = (state) => console.log(`Count is ${state.count}`)

const state = {
  count: 0
}

const eventMap = [
  ['count', allowEventType('increment'), mapCount]
]

const store = createStore(eventMap, state)

store.subscribe(traceCurrentCount)

store.dispatch({type: 'increment', payload: store.state.count})
store.dispatch({type: 'increment', payload: store.state.count})
store.dispatch({type: 'increment', payload: store.state.count})
