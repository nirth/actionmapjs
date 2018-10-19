// @flow
import type {
  Property,
  Selector,
  PropertryAndSelector,
  SelectorsParser,
  UnparsedSelectors,
  UnparsedSelectorsAsPropertiesList,
  UnparsedSelectorsAsPropertySelectorMap,
  Selectors,
} from './types'

const defaultSelectors: Selectors = [['fullState', (state) => state]]

const simpleSelectorFactory = (propertyName: string): Selector => (state: any): any => state[propertyName]

const parsePropertyToPropertySelectorPair = (property: Property): PropertryAndSelector => ([property, simpleSelectorFactory(property)])

const parsePropertiesToSelectors = (unparsedSelectors: UnparsedSelectorsAsPropertiesList): Selectors => unparsedSelectors
  .reduce(
    (parsedSelectors, property) => parsedSelectors.concat([parsePropertyToPropertySelectorPair(property)]),
    []
  )

const parseSelectors: SelectorsParser = (unparsedSelectors: ?UnparsedSelectors): Selectors => {
  if (Array.isArray(unparsedSelectors)) {
    return parsePropertiesToSelectors(unparsedSelectors)
  } else if (unparsedSelectors !== undefined && unparsedSelectors !== null && typeof unparsedSelectors === 'object') {
    // FIXME: Casting to `any` is rather ugly obviously, but flow keeps complaining about mixed types.
    // FIXME: Essentially I need to find a nice compromise betweet a lot of boilerplate code and type safety.
    return (Object.entries(unparsedSelectors): any)
  }

  return defaultSelectors
}

export const bdd = {
  simpleSelectorFactory,
}

export default parseSelectors
