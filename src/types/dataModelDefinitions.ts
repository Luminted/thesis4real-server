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

export interface IAbstractCardEntity extends Pick<CardEntity, "entityId" | "faceUp" | "metadata"> {}

export interface HandCard extends IAbstractCardEntity {
    ownerDeck: string,
    revealed: boolean
}
export interface CardEntity extends Entity {
    entityId: string,
    entityType: EntityTypes.CARD,
    faceUp: boolean,
    ownerDeck: MaybeNull<string>,
}

export interface DeckEntity extends Entity {
    entityType: EntityTypes.DECK
    cards: IAbstractCardEntity[],
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