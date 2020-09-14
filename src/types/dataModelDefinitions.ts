import {MaybeNull} from './genericTypes'
import { ClientConnectionStatuses } from './socketTypes';
import { GameStateStore } from '../stores/GameStateStore';

export enum CardTypes {
    FRENCH = 'FRENCH'
}

export interface CardTypeConfig {
    baseHeight: number,
    baseWidth: number,
}

export interface FrenchCardConfig extends CardTypeConfig {
    cardRange: any[],
    suits: string[]
}

export type CardConfig = FrenchCardConfig;

export interface Entity {
    readonly entityType: EntityTypes,
    readonly entityId: string,
    height:number,
    width: number,
    positionX: number,
    positionY: number,
    grabbedBy: MaybeNull<string>
    zIndex: number,
    isBound: boolean
}

export interface CardRepresentation {
    cardType: CardTypes,
    entityId: string,
    face: string,
    entityType: EntityTypes.CARD,
    faceUp: boolean,
    ownerDeck: MaybeNull<string>
}

export interface CardEntity extends Entity {
    cardType: CardTypes,
    entityId: string,
    face: string,
    entityType: EntityTypes.CARD,
    faceUp: boolean,
    ownerDeck: MaybeNull<string>
}

export interface DeckEntity extends Entity {
    entityType: EntityTypes.DECK
    cards: CardRepresentation[],
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
    //TODO: flatten this out
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
    topZIndex: number,
}

export type CardTable = {
    readonly gameStateStore: GameStateStore,
    readonly seats: Seats[],
    readonly tableWidth: number,
    readonly tableHeight: number,
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