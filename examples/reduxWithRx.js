import Rx from 'rxjs'
import {v4} from 'uuid'





// class Store {
//   constructor(initialState, reducers) {
//     this.initialState = initialState


//     this.subject = (new Rx.Subject())
      
//     this.subscribe(this.updateState)
//   }

//   subscribe(handler) {
//     this.subject
//   }
// }

const balanceReducer = (balance, action) => {
  const {type, payload: {price}} = action

  switch (type) {
    case 'PURCHASE':
      return balance - price
    case 'SELL':
      return balance + price
    default:
      return balance
  }
}

const inventoryReducer = (inventory, action) => {
  const {type, payload: {name, amount}} = action
  const currentAmount = inventory[name]

  switch(type) {
    case 'PURCHASE':
      return Object
        .assign({}, inventory, {[name]: currentAmount + amount})
    case 'SELL':
      return Object
        .assign({}, inventory, {[name]: currentAmount - amount})
    default:
      return inventory
  }
}

const combineReducers = (reducers) => (state, action) => Object
  .entries(reducers)
  .map(([key, reducer]) => ({[key]: reducer(state[key], action)}))
  .reduce((state, subState) => Object.assign({}, state, subState))

const shopReducer = combineReducers({
  balance: balanceReducer,
  inventory: inventoryReducer,
})

const transaction = (name, amount, price) => ({
  name, amount, price
})

const actions = [
  {type: 'PURCHASE', payload: transaction('smokeleaf', 10, 10)},
  {type: 'PURCHASE', payload: transaction('sofas', 1, 10)},
  {type: 'SELL', payload: transaction('smokeleaf', 5, 10)},
  {type: 'SELL', payload: transaction('smokeleaf', 5, 20)},
]

const initialState = {
  balance: 20,
  inventory: {
    sofas: 0,
    smokeleaf: 0,
  },
}

console.log(actions.reduce(shopReducer, initialState))


