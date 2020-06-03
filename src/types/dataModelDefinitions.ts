import {MaybeNull} from './genericTypes'
import { ClientConnectionStatuses } from './socketTypes';
import { GrabbedEntity, CardRepresentation, DeckEntity, CardEntity } from './entityTypes';

export type Client = {
    clientInfo: ClientInfo,
    grabbedEntitiy: GrabbedEntity,
    status: ClientConnectionStatuses
}

export type ClientHand = {
    clientId: string,
    cards: CardRepresentation[],
}

export type ClientInfo ={
    clientId: string,
    clientName?: string,
    seatedAt: Seats
}

export enum Seats {
    SOUTH = 'SOUTH',
    NORTH = 'NORTH',
    SOUTH_WEST = 'SOUTH_WEST',
    SOUTH_EAST = 'SOUTH_EAST',
    NORTH_WEST = 'NORTH_WEST',
    NORTH_EAST = 'NORTH_EAST'
} 

export interface GameState {
    cards: Map<string, CardEntity>,
    decks: Map<string, DeckEntity>,
    clients: Map<string, Client>,
    hands: Map<string, ClientHand>,
    entityScale: number,
    emptySeats: Seats[],
    topZIndex: number,
}

export type CardTable = {
    readonly tableId: string,
    socketClientIdMapping: {[key: string]: string},
    readonly seats: Seats[],
    readonly defaultPosition: [number, number],
    readonly tableWidth: number,
    readonly tableHeight: number
}

export type SerializedGameState = {
    cards: CardEntity[],
    decks: DeckEntity[],
    clients: Client[],
    hands: ClientHand[],
    entityScale: number
}