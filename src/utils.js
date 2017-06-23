
export const allowEventType = (allowedEventType) => (event) => event.type === allowedEventType;

export const createSimpleEvent = (type, payload) => ({type, payload});

export const simpleEventFactory = (type) => (payload) => createSimpleEvent(type, payload);
