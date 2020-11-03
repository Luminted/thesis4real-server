import { CardTable } from "../types/dataModelDefinitions";


export const extractEmptySeats = (state: CardTable) => {
    return state.emptySeats;
}