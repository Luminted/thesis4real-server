 
import {generate} from 'short-uuid';
import {CardTable, Seats, CardEntity, Client, DeckEntity, ClientHand, GameState} from '../../types/dataModelDefinitions'




export function createTable(tableWidth: number, tableHeight: number, entityScale?: number, defaultPosition?: [number, number], tableId?:string): [CardTable, GameState]  {
    return [{
        tableId: tableId || generate(),
        socketClientIdMapping: {},
        defaultPosition: defaultPosition || [0,0],
        tableWidth,
        tableHeight,
        seats: [Seats.NORTH, Seats.NORTH_EAST, Seats.NORTH_WEST, Seats.SOUTH, Seats.SOUTH_EAST, Seats.SOUTH_WEST],   
    },
    {
        cards: new Map<string, CardEntity>(),
        clients: new Map<string, Client>(),
        decks: new Map<string, DeckEntity>(),
        hands: new Map<string, ClientHand>(),
        entityScale: entityScale || 1,
        topZIndex: 0,
        emptySeats: [Seats.NORTH, Seats.SOUTH, Seats.NORTH_WEST, Seats.SOUTH_WEST, Seats.NORTH_EAST, Seats.SOUTH_EAST]
    }]
}