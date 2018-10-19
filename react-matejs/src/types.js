// @flow
export type Property = string
export type Selector = (any) => any
export type PropertryAndSelector = [Property, Selector]
export type PropertyAndValue = [Property, any]
export type Selectors = PropertryAndSelector[]

export type UnparsedSelectorsAsPropertiesList = Property[]
export type UnparsedSelectorsAsPropertySelectorMap = {[Property]: Selector}
export type UnparsedSelectors = UnparsedSelectorsAsPropertiesList | UnparsedSelectorsAsPropertySelectorMap

export type SelectorsParser = (?UnparsedSelectors) => Selectors

export type MateState = {
  [Property]: any
}

export type WrappedComponentState = {
  mateState: any,
}