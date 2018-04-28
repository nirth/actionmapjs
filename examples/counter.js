import { createStore, allowEventType } from ".matejs/src";

// Selector, in real life we would memoize it
const selectSum = state => state.sum;
// Creating simple event with type and payload
const createAddEvent = summand => ({ type: "add", payload: summand });

// Mapper takes in values and returns new values.
// I know, at this point it actually looks exactly like reducing,
const mapSum = (event, state) => {
  const sum = selectSum(state);
  return sum + event.payload;
};

// Define initial state
const initialState = { sum: 0 };

// And here it get's interesting, define eventMap
// EventMap will tell which mapper should be triggered for specific field
const eventMap = [["sum", allowEventType("add"), mapSum]];

// In example above, every time we get event `add`,
//function `mapSum` will be used to map new value to `sum`.

// Standard - create store
const store = createStore(eventMap, initialState);

store.dispatch(createAddEvent(1));
store.dispatch(createAddEvent(2));
store.dispatch(createAddEvent(3));

console.log(`Sum is ${store.state.sum}`); // Sum is 6
