import {Event, EventMap, EventMapField, EventType, Payload, Path, Guard, Transformer} from './mate'

export const allowEventType = (allowedType: string) => (event: Event): boolean => event.type === allowedType

export const createSimpleEvent = (type: EventType, payload: Payload = null): Event => ({type, payload})

export const simpleEventFactory = (type: EventType) => (payload: Payload): Event => createSimpleEvent(type, payload)

export const eventMap = (...items: EventMapField[]): EventMap => items

export const flatEventMapField = (path: Path, guard: Guard, transformer: Transformer): EventMapField => ({
  path,
  guard,
  transformer,
})

// tslint:disable:no-shadowed-variable
export const deepEventMapField = (path: Path, guard: Guard, eventMap: EventMap): EventMapField => ({
  path,
  guard,
  eventMap,
})
// tslint:enable
