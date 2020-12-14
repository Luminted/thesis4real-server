import { IGenericVerb } from "./index";

export enum EDeckVerbTypes {
  ADD_DECK = "ADD_DECK",
  DRAW_FACE_UP = "DRAW_FACE_UP",
  DRAW_FACE_DOWN = "DRAW_FACE_DOWN",
  RESET = "RESET",
  SHUFFLE = "SHUFFLE",
}

/**
 * @position where the new deck will be placed
 * @rotation rotation the deck will be placed at
 * @metadata client side info of deck
 * @containedCardsMetadata client side info of cards in deck
 */
export interface IAddDeckVerb extends Omit<IGenericVerb, "entityId" | "clientId"> {
  type: EDeckVerbTypes.ADD_DECK;
  rotation: number;
  metadata: object;
  containedCardsMetadata: object[];
}

/**
 * @entityId deck to draw from
 */
export interface IDrawFaceUpVerb extends Omit<IGenericVerb, "clientId" | "positionX" | "positionY"> {
  type: EDeckVerbTypes.DRAW_FACE_UP;
}

/**
 * @entityId deck to draw from
 */
export interface IDrawFaceDownVerb extends Omit<IGenericVerb, "clientId" | "positionX" | "positionY"> {
  type: EDeckVerbTypes.DRAW_FACE_DOWN;
}

/**
 * @entityId deck being reset
 */
export interface IResetVerb extends Omit<IGenericVerb, "clientId" | "positionX" | "positionY"> {
  type: EDeckVerbTypes.RESET;
}

/**
 * @entityId deck being shuffled
 */
export interface IShuffleVerb extends Omit<IGenericVerb, "clientId" | "positionX" | "positionY"> {
  type: EDeckVerbTypes.SHUFFLE;
}
