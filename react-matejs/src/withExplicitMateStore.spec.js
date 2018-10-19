import React from 'react'
import chai, {expect} from 'chai'
import Enzyme, {mount, render} from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import dirtyChai from 'dirty-chai'
import sinonChai from 'sinon-chai'
import sinonChaiInOrder from 'sinon-chai-in-order'
import {spy} from 'sinon'

import {createStore} from 'matejs'
import withExplicitMateStore from './withExplicitMateStore'
import {setUpDomEnvironment} from './enzyme.fixtures'

chai.use(dirtyChai)
chai.use(sinonChai)
chai.use(sinonChaiInOrder)

setUpDomEnvironment()
Enzyme.configure({adapter: new Adapter()})

const ColorfulShape = (props) => {
  const {dispatch, color, shape} = props
  const message = `I am ${color} ${shape}`

  return (
    <div>
      <span className="message">{message}</span>
    </div>
  )
}

const CashBankAccount = ({swift, iban, currency}) => {
  return (
    <div>
      <span className="swift">{swift}</span>
      <span className="iban">{iban}</span>
      <span className="currency">{currency}</span>
    </div>
  )
}

const InteractiveShape = (props) => {
  const {dispatch, color, shape, currentColor, currentShape} = props
  const message = `I am ${currentColor} ${currentShape}`
  const updateColorAndShape = () => dispatch({type: 'updateShapeAndColor', payload: {color, shape}})

  return (
    <div>
      <span className="message">{message}</span>
      <button onClick={updateColorAndShape} />
    </div>
  )
}

describe('Higher-order Component factory withExplicitMateStore should', () => {
  it('exist and be a function', () => {
    expect(withExplicitMateStore).to.exist()
    expect(withExplicitMateStore).to.be.a('function')
  })

  it('wrap components, and pass properties through', () => {
    const shapeState = {color: 'Red', shape: 'Square'}
    const shapeStore = createStore([], shapeState)
    const StateAwareCashBankAccount = withExplicitMateStore(shapeStore, CashBankAccount, ['color', 'shape'])

    const wrapper = mount(<StateAwareCashBankAccount swift="BUKBGB22" iban="GBBUKBGB221234567890" currency="GBP" />)
    expect(wrapper.find('.swift').text()).to.equal('BUKBGB22')
    expect(wrapper.find('.iban').text()).to.equal('GBBUKBGB221234567890')
    expect(wrapper.find('.currency').text()).to.equal('GBP')
  })

  it('wrap components, and let them read state', () => {
    const shapeState = {color: 'Red', shape: 'Square'}
    const shapeStore = createStore([], shapeState)
    const StateAwareColorfulShape = withExplicitMateStore(shapeStore, ColorfulShape, ['color', 'shape'])

    const wrapper = mount(<StateAwareColorfulShape />)
    expect(wrapper.find('span').text()).to.equal(`I am ${shapeState.color} ${shapeState.shape}`)
  })

  xit('wrap components, and let them update state by dispatching events', () => {
    const shapeState = {color: 'Red', shape: 'Square'}
    const shapeStore = createStore([], shapeState)
    const StateAwareColorfulShape = withExplicitMateStore(shapeStore, InteractiveShape, {
      currentColor: (state) => state.color,
      currentShape: (state) => state.shape
    })

    const wrapper = mount(<StateAwareColorfulShape color="Blue" shape="Triangle" />)
    expect(wrapper.find('span').text()).to.equal(`I am ${shapeState.color} ${shapeState.shape}`)
    wrapper.find('button').simulate('click')
    expect(wrapper.find('span').text()).to.equal(`I am Blue Triangle`)
  })
})