// @flow
import type {Event, EventMap, State, Store, Payload} from './types'
import {Subject} from 'rxjs'
import {createNextState} from './createNextState'

const DEFAULT_OPTIONS = {
  debugMode: false,
  developmentMode: false,
}

export const createStore = (eventMap: EventMap, initialState: State, middleware: any = [], options: any = null) => {
  const history = [initialState]
  const publisher = new Subject()
  const safeOptions = options === null ? DEFAULT_OPTIONS : options
  const developmentMode = safeOptions.developmentMode

  const store: Store = {
    get state(): State {
      return history[history.length - 1]
    },

    subscribe: (onNext: any) => {
      return publisher.subscribe(onNext)
    },
    dispatch: (event: Event): void => {
      if (developmentMode) {
        console.log('Store.dispatch', event)
      }
  
      const previousState = history[history.length - 1]
  
      const nextState = createNextState(eventMap, previousState, [], event.type, event.payload)
  
      history.push(nextState)
  
      publisher.next(nextState)
    }
  }

  return store
}
