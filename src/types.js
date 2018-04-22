// @flow

export type GuardFunction = (event: Event) => boolean
export type Guard = GuardFunction | boolean

export type Event = {
  type: string,
  payload: ?Object,
}

export type State = ?Object

export type Transformer = (event: Event, state: State, subState: State) => State

export type EventMapItem = [string, Guard, Transformer]
export type EventMap = EventMapItem[]
