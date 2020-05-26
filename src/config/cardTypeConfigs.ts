import { FrenchCardConfig, CardConfig, CardTypes } from "../types/dataModelDefinitions"

const frenchCardConfig: FrenchCardConfig = {
    baseHeight: 88,
    baseWidth: 64,
    cardRange: [2,3,4,5,6,7,8,9,10,'J','Q','K','A'],
    suits: ['Heart', 'Club', 'Spade', 'Diamond']
}

export const cardConfigLookup: {[key in CardTypes]?: CardConfig} = {
    [CardTypes.FRENCH]: frenchCardConfig 
}