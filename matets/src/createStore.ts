import PubSub from './PubSub'
import createNextState from './createNextState'
import {Event, EventMap, Payload, State, Store, StateListener} from './datamodel'

const DEFAULT_OPTIONS = {
  developmentMode: false,
  traceMode: false,
}

const createStore = (eventMap: EventMap, initialState: State, middleware: any = [], options: any = null) => {
  const history = [initialState]
  const publisher = new PubSub<State>()
  const safeOptions = options === null ? DEFAULT_OPTIONS : options
  const developmentMode = safeOptions.developmentMode
  const traceMode = safeOptions.traceMode

  const store: Store = {
    get state(): State {
      return history[history.length - 1]
    },

    subscribe: (next: any): StateListener => {
      return publisher.add(next)
    },

    dispatch: (event: Event): Payload => {
      const previousState: State = history[history.length - 1]

      const nextState: State = createNextState(eventMap, previousState, event.type, event.payload)

      history.push(nextState)
      publisher.emit(nextState)

      return event.payload
    },
  }

  return store
}

export default createStore
