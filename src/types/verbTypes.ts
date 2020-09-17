import { EntityTypes } from "./dataModelDefinitions";
import { MaybeNull } from "./genericTypes";

export enum SharedVerbTypes {
    GRAB_FROM_TABLE = 'GRAB_FROM_TABLE',
    MOVE = 'MOVE',
    RELEASE = 'RELEASE',
    REMOVE = 'REMOVE',
    ADD = 'ADD',
    MOVE_TO = 'MOVE_TO',
    ROTATE = 'ROTATE',
}

export enum CardVerbTypes {
    FLIP = 'FLIP',
    PUT_IN_HAND = 'PUT_IN_HAND',
    PUT_ON_TABLE = 'PUT_ON_TABLE',
    GRAB_FROM_HAND = 'GRAB_FROM_HAND'
}

export enum DeckVerbTypes {
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

export interface RotateVerb extends SharedVerb {
    angle: number,
}

export type Verb = CardVerb | DeckVerb | SharedVerb | RotateVerb;