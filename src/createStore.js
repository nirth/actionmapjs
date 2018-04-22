import {List} from 'immutable'
import {Subject} from 'rxjs'
import {createNextState} from './createNextState'

class Store {
  constructor(eventMap, state) {
    this.publisher = new Subject()

    this.history = List.of(state)
    this.eventMap = eventMap
  }

  dispatch(event) {
    const previousState = this.state
    const eventMap = this.eventMap

    const nextState = createNextState(eventMap, previousState, [], event)

    this.pushState(nextState)

    this.publisher.next(nextState)
  }

  subscribe(onNext) {
    return this.publisher.subscribe(onNext)
  }

  pushState(state) {
    this.history = this.history.push(state)
  }

  get state() {
    return this.history.last()
  }
}

export const createStore = (eventMap, initialState) => new Store(eventMap, initialState)
