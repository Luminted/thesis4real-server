import {MaybeNull} from './genericTypes'

export interface BaseCard {
    entityId: string,
    face: string,
    entityType: EntityTypes.CARD;

}

export interface CardEntity extends BaseCard {
    width: number,
    height: number,
    scale: number,
    turnedUp: boolean,
    positionX: number,
    positionY: number,
    ownerDeck: MaybeNull<string>
}

export interface DeckEntity {
    entityId: string,
    entityType: EntityTypes.DECK
    positionX: number,
    positionY: number,
    width: number,
    height: number
    scale: number,
    cards: BaseCard[],
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
    grabbedEntitiy: GrabbedEntity
}

export type ClientInfo ={
    clientId: string,
    clientName?: string,
}

export interface GameState {
    cards: CardEntity[],
    decks: DeckEntity[],
    clients: Client[]
}