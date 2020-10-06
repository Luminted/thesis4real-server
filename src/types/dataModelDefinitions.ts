import {MaybeNull} from './genericTypes'
import { ClientConnectionStatuses } from './socketTypes';
import { GameStateStore } from '../stores/GameStateStore';

export interface Entity {
    readonly entityType: EntityTypes,
    readonly entityId: string,
    positionX: number,
    positionY: number,
    grabbedBy: MaybeNull<string>
    zIndex: number,
    rotation: number,
    metadata?: object 
}

export interface DeckCard extends Pick<CardEntity, "entityId" | "faceUp" | "metadata"> {
    revealed: boolean,
}

export interface HandCard extends DeckCard {
    ownerDeck: string,
}
export interface CardEntity extends Entity {
    entityId: string,
    entityType: EntityTypes.CARD,
    faceUp: boolean,
    ownerDeck: MaybeNull<string>,
}

export interface DeckEntity extends Entity {
    entityType: EntityTypes.DECK
    cards: DeckCard[],
    drawIndex: number
}

export enum EntityTypes {
    CARD = 'CARD',
    DECK = 'DECK'
}

export type GrabbedEntity = MaybeNull<{
    entityId: string,
    entityType: EntityTypes
    grabbedAtX: number,
    grabbedAtY: number
}>

export type Client = {
    clientInfo: ClientInfo,
    grabbedEntitiy: GrabbedEntity,
    status: ClientConnectionStatuses
}

export type ClientHand = {
    clientId: string,
    cards: HandCard[],
}

export type ClientInfo = {
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
    topZIndex: number,
}

export type CardTable = {
    readonly gameStateStore: GameStateStore,
    readonly seats: Seats[],
    defaultPosition: [number, number],
    emptySeats: Seats[],
}

export type SerializedGameState = {
    cards: CardEntity[],
    decks: DeckEntity[],
    clients: Client[],
    hands: ClientHand[],
    entityScale: number
}