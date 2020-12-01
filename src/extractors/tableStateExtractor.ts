import { TCardTable } from "../typings";


export const extractEmptySeats = (state: TCardTable) => {
    return state.emptySeats;
}