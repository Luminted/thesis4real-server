import {MaybeNull} from './genericTypes'
import Hashmap from 'hashmap'

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

export interface EntitySyncObject {
    entityId: string,
    positionX: number,
    positionY: number,
    grabLocked: boolean
}

export interface CardEntitySyncObject extends EntitySyncObject {
    faceUp: boolean
}

export interface DeckEntitySyncObject extends EntitySyncObject {
    cards: CardRepresentation[]
}

export interface BaseEntity {
    entityType: EntityTypes,
    entityId: string,
    height:number,
    width: number,
    scale: number,
    positionX: number,
    positionY: number,
    grabLocked: boolean
}

export interface CardRepresentation {
    cardType: CardTypes,
    entityId: string,
    face: string,
    entityType: EntityTypes.CARD,
    faceUp: boolean,
    ownerDeck: MaybeNull<string>
}

export interface CardEntity extends BaseEntity {
    cardType: CardTypes,
    entityId: string,
    face: string,
    entityType: EntityTypes.CARD,
    faceUp: boolean,
    ownerDeck: MaybeNull<string>
}

export interface DeckEntity extends BaseEntity {
    entityType: EntityTypes.DECK
    cards: Hashmap<string,CardRepresentation>,
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
    grabbedEntitiy: GrabbedEntity
}

export type ClientHand = {
    clientId: string,
    cards: Hashmap<string,CardRepresentation>,
}

export type ClientInfo ={
    clientId: string,
    clientName?: string,
    seatedAt: Directions
}

export enum Directions {
    SOUTH = 'SOUTH',
    NORTH = 'NORTH',
    SOUTH_WEST = 'SOUTH_WEST',
    SOUTH_EAST = 'SOUTH_EAST',
    NORTH_WEST = 'NORTH_WEST',
    NORTH_EAST = 'NORTH_EAST'
} 

export type Boundary = {
    top: number,
    left: number,
    bottom: number,
    right: number
}

export interface GameState {
    cards: Hashmap<string, CardEntity>,
    decks: Hashmap<string, DeckEntity>,
    clients: Hashmap<string, Client>,
    hands: Hashmap<string, ClientHand>,
    cardScale: number,
    emptySeats: Directions[],
    cardBoundary: MaybeNull<Boundary>,
    deckBoundary: MaybeNull<Boundary>
}

export type PlayTable = {
    tableId: string,
    clientLimit: number
    gameState: GameState,
}

export type SyncState = {
    updatedCards: CardEntitySyncObject[];
    newCards: CardEntity[];
}