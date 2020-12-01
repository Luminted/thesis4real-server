import {GenericVerb} from "./index";

export enum DeckVerbTypes {
    ADD_DECK = 'ADD_DECK',
    DRAW_FACE_UP = 'DRAW_FACE_UP',
    DRAW_FACE_DOWN = 'DRAW_FACE_DOWN',
    RESET = 'RESET',
    SHUFFLE = 'SHUFFLE',
}

/**
 * @position where the new deck will be placed
 * @rotation rotation the deck will be placed at
 * @metadata client side info of deck
 * @containedCardsMetadata client side info of cards in deck
 */
export interface IAddDeckVerb extends Omit<GenericVerb, "entityId" | "clientId"> {
    type: DeckVerbTypes.ADD_DECK
    rotation: number,
    metadata: object,
    containedCardsMetadata: object[]
}

/**
 * @entityId deck to draw from
 */
export interface IDrawFaceUpVerb extends Omit<GenericVerb, "clientId" | "positionX" | "positionY"> {
    type: DeckVerbTypes.DRAW_FACE_UP
}

/**
 * @entityId deck to draw from
 */
export interface IDrawFaceDownVerb extends Omit<GenericVerb, "clientId" | "positionX" | "positionY"> {
    type: DeckVerbTypes.DRAW_FACE_DOWN
}

/**
 * @entityId deck being reset
 */
export interface IResetVerb extends Omit<GenericVerb, "clientId" | "positionX" | "positionY"> {
    type: DeckVerbTypes.RESET
}

/**
 * @entityId deck being shuffled
 */
export interface IShuffleVerb extends Omit<GenericVerb, "clientId" | "positionX" | "positionY"> {
    type: DeckVerbTypes.SHUFFLE
}