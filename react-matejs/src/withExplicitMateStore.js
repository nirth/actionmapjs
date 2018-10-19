// @flow

import React, {Component} from 'react'
import type {Property, Selector, Selectors, PropertyAndValue, UnparsedSelectors, WrappedComponentState, MateState} from './types'
import parseSelectors from './parseSelectors'

type Props = any

const withExplicitMateStore = (store: any, component: any, selectors: UnparsedSelectors): any => {
  const WrappedComponent = component
  const parsedSelectors = parseSelectors(selectors)

  class MateStoreAware extends Component<Props> {
    constructor(props) {
      super(props)

      this.state = ({mateState: {}}: any)
    }

    componentDidMount() {
      this.onNextState(store.state)
      store.subscribe(this.onNextState)
    }

    componentWillUnmount() {
      store.unsubscribe(this.onNextState)
    }

    onNextState(state: any) {
      if (parsedSelectors === null) {
        return
      }

      const nextMateState: any = parsedSelectors
        .map(([property, selector]) => [property, selector(state)])
        .reduce((
          state, [property, value]) => Object.assign(state, { [property]: value }),
          {}
        )

      const nextState: any = ({mateState: nextMateState}: any)

      this.setState(nextState)
    }

    dispatch(event) {
      store.dispatch(event)
    }

    render() {
      const wrappedComponentState: any = this.state.mateState
      return <WrappedComponent {...this.props} {...wrappedComponentState} dispatch= {this.dispatch} />
    }
  }

  return MateStoreAware
}

export default withExplicitMateStore
