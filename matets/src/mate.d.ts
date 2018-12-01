import {Subscription} from 'rxjs'

export type Value = string | number | boolean | object

export type EventType = string
export type Payload = any

export type Event = {
  type: EventType
  payload: Payload
}

export type onNext = (event: Event) => void

export interface Store {
  subscribe: (next: onNext) => Subscription
  dispatch: (event: Event) => Payload
  state: State
}

export type StoreOptions = {
  traceMode: boolean
  developmentMode: boolean
}

export type State = any

export type Transformer = (payload: Payload, currentValue?: Value, state?: State) => State

export type GuardResolver = (event: Event) => boolean
export type ResolvedGuard = boolean
export type Guard = ResolvedGuard | GuardResolver

export type PathResolver = (payload: Payload) => string
export type ResolvedPath = string
export type Path = ResolvedPath | PathResolver

export type EventMapField = {
  path: Path
  guard: Guard
  transformer?: Transformer
  eventMap?: EventMap
}

export type EventMap = EventMapField[]
