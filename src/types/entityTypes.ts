import { MaybeNull } from "./genericTypes";

export enum CardTypes {
    FRENCH = 'FRENCH'
}

export enum FrenchCardSuits {
    DIAMOND = 'DIAMOND',
    SPADE = 'SPADE',
    
}

export enum FrenchCardFaces {
    two = 'two',
    three = 'three',
    four = 'four',
    five = 'five',
    six = 'six',
    seven = 'seven',
    eight = 'eight',
    nine = 'nine',
    ten = 'ten',
    jack = 'jack',
    queen = 'queen',
    king = 'king',
    ace = 'ace',
}

export type CardFaceTypes = FrenchCardFaces;

export type CardTypeConfig = {
    baseHeight: number,
    baseWidth: number,
}

export interface FrenchCardConfig extends CardTypeConfig {
    cardRange: string[],
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
    face: CardFaceTypes,
    entityType: EntityTypes.CARD,
    faceUp: boolean,
    ownerDeck: MaybeNull<string>
}

export interface CardEntity extends Entity {
    cardType: CardTypes,
    entityId: string,
    suite: string,
    face: CardFaceTypes,
    entityType: EntityTypes.CARD,
    faceUp: boolean,
    ownerDeck: MaybeNull<string>
}

export interface DeckEntity extends Entity {
    entityType: EntityTypes.DECK,
    cardType: CardTypes,
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
