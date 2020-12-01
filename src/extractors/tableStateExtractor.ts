import { CardTable } from "../typings";


export const extractEmptySeats = (state: CardTable) => {
    return state.emptySeats;
}