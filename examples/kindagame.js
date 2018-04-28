// @flow

import {createStore, allowEventType} from 'matejs'

const a: string = 1

const transformNotifications = (event, notifications, state) => {
  console.log('transformNotifications:state', event, state)

  // if (event.type === 'startGame') return notifications.concat([{a: 1}])
  return 1
}

const identityTransformer = (event, state, subState) => {
  console.log('defaultEventHandler', event, subState, subState)

  return subState
}

const alwaysTrue = (event: string) => {
  console.log('alwaysTrue', event)
  return true
}

export const startGame = () => {
  console.log('startGame')
  const store = createStore(
    [
      ['notifications', true, transformNotifications],
      ['game', alwaysTrue, identityTransformer],
      // ['ui', alwaysTrue, [['hp', true, identityTransformer]]],
    ],
    {
      notifications: [],
      game: {a: 1},
      ui: {
        hp: 1,
      },
    },
    null,
    {
      developmentMode: true,
    }
  )

  store.dispatch({
    type: 'startGame',
    //   payload: {
    //     title: 'Welcome to your Adventure',
    //   },
  })

  return store
}

const store = startGame()

console.log(store.state)
