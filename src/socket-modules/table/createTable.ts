import {generate} from 'short-uuid';
import {PlayTable, Boundary, Directions} from '../../types/dataModelDefinitions'
import { MaybeNull, MaybeUndefined } from '../../types/genericTypes';


export function createTable(clientLimit: number, cardBoundary: MaybeNull<Boundary> = null, deckBoundary: MaybeNull<Boundary> = null): PlayTable {
    return {
        tableId: generate(),
        clientLimit,
        gameState: {
            cards:[],
            decks: [],
            clients: [],
            hands: [],
            cardBoundary,
            deckBoundary,
            cardScale: 1,
            emptySeats: [Directions.NORTH, Directions.NORTH_EAST, Directions.NORTH_WEST, Directions.SOUTH, Directions.SOUTH_EAST, Directions.SOUTH_WEST]
        }
    }
}