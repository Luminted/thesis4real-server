import { FrenchCardConfig, CardConfig, CardTypes, FrenchCardFaces } from "../types/entityTypes"

const frenchCardRange: string[] = [];
for(const face in FrenchCardFaces){
    if(!Number(face)){
        frenchCardRange.push(face);
    }
}
const frenchCardConfig: FrenchCardConfig = {
    baseHeight: 88,
    baseWidth: 64,
    cardRange: frenchCardRange,
    suits: ['Heart', 'Club', 'Spade', 'Diamond']
}

export const cardConfigLookup: {[key in CardTypes]?: CardConfig} = {
    [CardTypes.FRENCH]: frenchCardConfig 
}