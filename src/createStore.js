import {List} from 'immutable'
import {Subject} from 'rxjs'
import {createNextState} from './createNextState'

const DEFAULT_OPTIONS = {
  debugMode: false,
  developmentMode: false,
}

class Store {
  constructor(eventMap, state, middleware, options = DEFAULT_OPTIONS) {
    this.publisher = new Subject()

    this.history = List.of(state)
    this.eventMap = eventMap

    // Parsing Options
    this.options = options

    // Development/Debug code. Should use env instead
    this.developmentMode = options.developmentMode
  }

  dispatch(event) {
    if (this.developmentMode) {
      console.log('Store.dispatch', event)
    }

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

export const createStore = (eventMap, initialState, middleware, options) =>
  new Store(eventMap, initialState, middleware, options)
