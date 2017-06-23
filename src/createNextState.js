
const setState = (state, key, value) => Object.assign({}, state, {[key]: value});

export const createNextState = (eventMap, state) => (event) => {

};

export const processEventMap = (map, state, event) => map
  .reduce(
    (state, [key, mapper]) => {
      console.log('processEventMap', event);
      const nextValue = mapper(event, state);
      return setState(state, key, nextValue);
    },
    state
  );
