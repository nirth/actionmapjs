import {createStore, allowEventType} from './matejs/src'

const initialize = () => ({type: 'initialize'})
const updateFirstName = (firstName) => ({
  type: 'updateFirstName',
  payload: firstName,
})
const updateLastName = (lastName) => ({type: 'updateLastName', payload: lastName})
const updateAge = (age) => ({type: 'updateAge', payload: age})

const mapInitialization = () => true
const mapAge = ({payload: age}) => age
const mapFirstName = ({payload: firstName}) => firstName
const mapLastName = ({payload: lastName}) => lastName

// const store = createStore(
//   [
//     ['initialized', allowEventType('initialize'), mapInitialization],
//     [
//       'user',
//       true,
//       [
//         [
//           'name',
//           true,
//           [
//             ['firstName', allowEventType('updateFirstName'), mapFirstName],
//             ['lastName', allowEventType('updateLastName'), mapLastName],
//           ],
//         ],
//         ['age', allowEventType('updateAge'), mapAge],
//       ],
//     ],
//   ],
//   {
//     initialized: false,
//     user: {
//       name: {
//         firstName: null,
//         lastName: null,
//       },
//       age: null,
//     },
//   },
//   null,
//   {
//     developmentMode: true,
//   }
// )

const store = createStore(
  [
    ['initialized', true, mapInitialization],
    [
      'user',
      true,
      [['name', true, [['firstName', true, mapFirstName], ['lastName', true, mapLastName]]], ['age', true, mapAge]],
    ],
  ],
  {
    initialized: false,
    user: {
      name: {
        firstName: null,
        lastName: null,
      },
      age: null,
    },
    ui: {
      hp: 100,
      mp: 100,
    },
  },
  null,
  {
    developmentMode: true,
  }
)

store.dispatch(initialize())
store.dispatch(updateAge(32))
store.dispatch(updateFirstName('Malika'))
store.dispatch(updateLastName('Favre'))
store.dispatch(updateAge(22))

console.log(store.state)
