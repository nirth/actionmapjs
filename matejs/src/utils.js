export const allowEventType = (allowedEventType) => (event) => event.type === allowedEventType

export const createSimpleEvent = (type, payload = null) => ({type, payload})

export const simpleEventFactory = (type) => (payload) => createSimpleEvent(type, payload)

export const trace = (target, index) => {
  console.log(`Trace ${index}: ${target}`)
  console.log(target)
  console.log('End trace ${index}')

  return target
}
