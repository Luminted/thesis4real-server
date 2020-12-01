import {TMaybeNull} from './utilityTypings'
import { EClientConnectionStatuses } from './socketTypings';
import { GameStateStore } from '../stores/GameStateStore';

export interface IEntity {
    readonly entityType: EEntityTypes,
    readonly entityId: string,
    positionX: number,
    positionY: number,
    grabbedBy: TMaybeNull<string>
    zIndex: number,
    rotation: number,
    metadata?: object 
}

export interface IHandCard extends Pick<ICardEntity, "entityId" | "metadata" | "ownerDeck" | "faceUp"> {}

export interface IDeckCard extends Pick<ICardEntity, "entityId" | "metadata"> {}
export interface ICardEntity extends IEntity {
    entityId: string,
    entityType: EEntityTypes.CARD,
    faceUp: boolean,
    ownerDeck: TMaybeNull<string>,
}

export interface IDeckEntity extends IEntity {
    entityType: EEntityTypes.DECK
    cards: IDeckCard[],
    drawIndex: number
}

export enum EEntityTypes {
    CARD = 'CARD',
    DECK = 'DECK'
}

export type TGrabbedEntity = TMaybeNull<{
    entityId: string,
    entityType: EEntityTypes
    grabbedAtX: number,
    grabbedAtY: number
}>

export type TClient = {
    clientInfo: TClientInfo,
    grabbedEntity: TGrabbedEntity,
    status: EClientConnectionStatuses
}

export type TClientHand = {
    clientId: string,
    cards: IHandCard[],
    ordering: number[]
}

export type TClientInfo = {
    clientId: string,
    clientName?: string,
    seatId: string
}

export type TGameState = {
    cards: Map<string, ICardEntity>,
    decks: Map<string, IDeckEntity>,
    clients: Map<string, TClient>,
    hands: Map<string, TClientHand>,
    entityScale: number,
    topZIndex: number,
}

export type TCardTable = {
    readonly gameStateStore: GameStateStore,
    defaultPosition: [number, number],
    emptySeats: string[],
}

export type TSerializedGameState = {
    cards: ICardEntity[],
    decks: IDeckEntity[],
    clients: TClient[],
    hands: TClientHand[],
    entityScale: number
}