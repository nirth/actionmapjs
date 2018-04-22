// @flow

type GuardFunction = (event) => boolean
export type Guard = GuardFunction | boolean

type Event = {
  type: string,
  payload: ?Object,
}

type State = ?Object
type SubState = ?Object

type Transformer = (Event, ?State, ?SubState) => SubState
