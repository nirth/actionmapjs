EventMap.js
===

### Abstract

This is not a real library, instead this is an exploration of how to improve my work with Redux and React Redux, please don't use this in production.

The reason I'm playing around with this library is because I think that metaphor or a Reducer is not close enough, we are not reducing our state, we are mapping over it. This library explores this idea.

Consider following example:

```es6
// Selector, in real life we would memoize it
const selectSum = (state) => state.sum;
// Creating simple event with type and payload
const createAddEvent = (summand) => ({type: 'add', payload: summand})

// Mapper takes in values and returns new values.
// I know, at this point it actually looks exactly like reducing,
const mapSum = (event, state) => {
  const sum = selectSum(state)
  return sum + event.payload
}

// Define initial state
const initialState = {sum: 0}

// And here it get's interesting, define eventMap
// EventMap will tell which mapper should be triggered for specific field
const eventMap = [['sum', allowEventType('add'), mapSum]]

// In example above, every time we get event `add`,
//function `mapSum` will be used to map new value to `sum`.

// Standard - create store
const store = createStore(eventMap, initialState)

store.dispatch(createAddEvent(1))
store.dispatch(createAddEvent(2))
store.dispatch(createAddEvent(3))

console.log(`Sum is ${store.state.sum}`) // Sum is 6
```

## Architecture Decisions

## Explicit "curried" function, instead of auto-curry.
Explicitly defined curried function (e.g. `(a, b) => (c) => a + b + c`) was favoured in long run due to performance concerns,
even if curry provided by Ramda or Lodash is much prettier and cleaner solution.





