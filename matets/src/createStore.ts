// @flow
import {Subject, Subscription} from 'rxjs'
import createNextState from './createNextState'
import {Event, EventMap, Payload, State, Store} from './mate'

const DEFAULT_OPTIONS = {
  developmentMode: false,
  traceMode: false,
}

const createStore = (eventMap: EventMap, initialState: State, middleware: any = [], options: any = null) => {
  const history = [initialState]
  const publisher = new Subject()
  const safeOptions = options === null ? DEFAULT_OPTIONS : options
  const developmentMode = safeOptions.developmentMode
  const traceMode = safeOptions.traceMode

  const store: Store = {
    get state(): State {
      return history[history.length - 1]
    },

    subscribe: (next: any): Subscription => {
      return publisher.subscribe(next)
    },

    dispatch: (event: Event): Payload => {
      const previousState: State = history[history.length - 1]

      const nextState: State = createNextState(eventMap, previousState, event.type, event.payload)

      history.push(nextState)

      publisher.next(nextState)

      return event.payload
    },
  }

  return store
}

export default createStore
