import { AnonymousSubject } from "rxjs/internal/Subject";

// @flow

export type Key = string | Function // (string, or Type / Class)
export type Value = string | number | boolean | ?Object

export type EventType = Key
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

export type GuardFunction = (eventType: EventType, payload: Payload) => boolean
export type Guard = GuardFunction | boolean

export type State = ?Object

export type Transformer = (payload: Payload, value: Value, state: ?State) => State

export type EventMapItem = [string, Guard, Transformer]
export type EventMap = EventMapItem[]

