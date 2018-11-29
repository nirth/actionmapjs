// @flow
import type {Event, EventType, EventMap, EventMapItem, Guard, Payload} from './types'

export const allowEventType = (allowedEventType: Guard) => ({type, payload}: Event): boolean =>
  type === allowedEventType

export const createSimpleEvent = (type: EventType, payload: Payload = null): Event => ({type, payload})

export const simpleEventFactory = (type: EventType) => (payload: Payload): Event => createSimpleEvent(type, payload)

export const eventMap = (...items: EventMapItem): EventMap => [...items]

export const trace = (target: any, index: any) => {
  console.log(`Trace ${index}: ${target}`)
  console.log(target)
  console.log('End trace ${index}')

  return target
}
