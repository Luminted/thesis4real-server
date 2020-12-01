import {MaybeNull} from './utilityTypings'
import { ClientConnectionStatuses } from './socketTypings';
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

export interface HandCard extends Pick<CardEntity, "entityId" | "metadata" | "ownerDeck" | "faceUp"> {}

export interface DeckCard extends Pick<CardEntity, "entityId" | "metadata"> {}
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
    grabbedEntity: GrabbedEntity,
    status: ClientConnectionStatuses
}

export type ClientHand = {
    clientId: string,
    cards: HandCard[],
    ordering: number[]
}

export type ClientInfo = {
    clientId: string,
    clientName?: string,
    seatId: string
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
    defaultPosition: [number, number],
    emptySeats: string[],
}

export type SerializedGameState = {
    cards: CardEntity[],
    decks: DeckEntity[],
    clients: Client[],
    hands: ClientHand[],
    entityScale: number
}