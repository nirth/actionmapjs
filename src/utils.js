export const allowEventType = (allowedEventType) => (event) => event.type === allowedEventType

export const createSimpleEvent = (type, payload = null) => ({type, payload})

export const simpleEventFactory = (type) => (payload) => createSimpleEvent(type, payload)
