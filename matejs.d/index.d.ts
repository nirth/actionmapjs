// Type definitions for matejs 0.3
// Project: https://github.com/nirth/matejs
// Definitions by: David Sergey Grigoryan <https://github.com/nirth>
// Definitions: https://github.com/nirth/matejs
// TypeScript Version: 2.4
/// <reference types="node" />

import * as matejs from 'matejs'

declare module 'some-js-lib' {
  export type GuardFunction = (event: Event) => boolean
  export type Guard = GuardFunction | boolean

  export type Event = {
    type: string,
    payload: åObject?,
  }

  export type State = ?Object

  export type Transformer = (event: Event, state: State?, subState: State?) => State

  export type EventMapItem = [string, Guard, Transformer]
  export type EventMap = EventMapItem[]
}

