import { CardEntity, DeckEntity, Entity, EntityTypes } from "./dataModelDefinitions";
import { MaybeNull } from "./genericTypes";

export enum SharedVerbTypes {
    GRAB_FROM_TABLE = 'GRAB_FROM_TABLE',
    MOVE = 'MOVE',
    RELEASE = 'RELEASE',
    REMOVE = 'REMOVE',
    MOVE_TO = 'MOVE_TO',
    ROTATE = 'ROTATE',
}

export enum CardVerbTypes {
    ADD_CARD = 'ADD_CARD',
    FLIP = 'FLIP',
    PUT_IN_HAND = 'PUT_IN_HAND',
    PUT_ON_TABLE = 'PUT_ON_TABLE',
    GRAB_FROM_HAND = 'GRAB_FROM_HAND',
}

export enum DeckVerbTypes {
    ADD_DECK = 'ADD_DECK',
    DRAW_FACE_UP = 'DRAW_FACE_UP',
    DRAW_FACE_DOWN = 'DRAW_FACE_DOWN',
    RESET = 'RESET',
    SHUFFLE = 'SHUFFLE',

}

export type VerbTypes = SharedVerbTypes | CardVerbTypes | DeckVerbTypes;

interface BaseVerb {
    type: VerbTypes 
    entityId:MaybeNull<string>,
    entityType: MaybeNull<EntityTypes>,
    clientId: string,
    positionX: number,
    positionY: number,
}

export interface CardVerb extends BaseVerb {
    type: CardVerbTypes,
    entityType: MaybeNull<EntityTypes.CARD>
}

export interface DeckVerb extends BaseVerb{
    type: DeckVerbTypes,
    entityType: MaybeNull<EntityTypes.DECK>,
}

export interface SharedVerb extends BaseVerb {
    type: SharedVerbTypes,
}

export interface AddCardVerb extends Omit<CardVerb, "entityId">, Pick<CardEntity, "rotation" | "faceUp" | "metadata"> {
    type: CardVerbTypes.ADD_CARD
}

export interface AddDeckVerb extends Omit<DeckVerb, "entityId">, Pick<DeckEntity, "rotation"> {
    type: DeckVerbTypes.ADD_DECK,
    metadata?: object,
    cardsMetadata?: object[]
}
export interface RotateVerb extends SharedVerb {
    angle: number,
}

export type Verb = CardVerb | DeckVerb | SharedVerb | RotateVerb;