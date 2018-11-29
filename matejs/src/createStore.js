// @flow
import type {Event, EventMap, State, Store, Payload} from './types'
import {Subject} from 'rxjs'
import {createNextState} from './createNextState'

const DEFAULT_OPTIONS = {
  developmentMode: false,
  traceMode: false,
}

export const createStore = (eventMap: EventMap, initialState: State, middleware: any = [], options: any = null) => {
  const history = [initialState]
  const publisher = new Subject()
  const safeOptions = options === null ? DEFAULT_OPTIONS : options
  const developmentMode = safeOptions.developmentMode
  const traceMode = safeOptions.traceMode

  const store: Store = {
    get state(): State {
      return history[history.length - 1]
    },

    subscribe: (onNext: any) => {
      return publisher.subscribe(onNext)
    },

    dispatch: (event: Event): Payload => {
      console.log('DISPATCH:', event.type, event.payload)
      if (traceMode) {
        console.log('Store.dispatch', event)
      }

      if (developmentMode) {
        if (!(typeof event.type === 'function' || typeof event.type === 'string')) {
          throw new Error(`Store.dispatch: Event.type has to be of Event type, instead got ${event.type}`)
        }
      }

      const previousState: State = history[history.length - 1]

      const nextState: State = createNextState(eventMap, previousState, [], event.type, event.payload)

      history.push(nextState)

      publisher.next(nextState)

      return event.payload
    },
  }

  return store
}
