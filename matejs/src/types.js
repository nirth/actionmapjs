import {AnonymousSubject} from 'rxjs/internal/Subject'

// @flow
export type Value = string | number | boolean | ?Object

export type EventType = string | Function
export type Payload = Value

export type Event = {
  type: EventType,
  payload: Payload,
}

export type Store = {
  subscribe: (onNext: Function) => any,
  pushState: (state: State) => State,
  dispatch: (event: Event) => void,
  state: State,
}

export type StoreOptions = {
  traceMode: boolean,
  developmentMode: boolean,
}

export type GuardFunction = (eventType: EventType, payload: Payload) => boolean
export type Guard = GuardFunction | boolean

export type State = ?Object

export type Transformer = (payload: Payload, currentValue: Value, state: ?State) => State

export type EventMapItem = [PathItem, Guard, Transformer] | EventMap
export type EventMap = EventMapItem[]

export type PathResolver = (payload: Payload) => string
export type PathItem = string | PathResolver
