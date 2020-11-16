import {GenericVerb} from "./index";

export enum CardVerbTypes {
    ADD_CARD = 'ADD_CARD',
    FLIP = 'FLIP',
    PUT_IN_HAND = 'PUT_IN_HAND',
    PUT_ON_TABLE = 'PUT_ON_TABLE',
    GRAB_FROM_HAND = 'GRAB_FROM_HAND',
}

/**
 * @position refers to where new card will be placed
 * @faceUp whether the card should be facing up or not
 * @rotation card will be placed at this rotation
 * @metadata client specific info of card
 */
export interface IAddCardVerb extends Omit<GenericVerb, "clientId" | "entityId" > {
    type: CardVerbTypes.ADD_CARD
    faceUp: boolean
    rotation: number
    metadata?: object
}

/**
 * @entityId card being flipped
 */
export interface IFlipVerb extends Omit<GenericVerb, "clientId" | "positionX" | "positionY" > {
    type: CardVerbTypes.FLIP
}

/**
 * @clientId the client whoes hand the card is placed in
 * @entityId the card being put in hand
 * @revealed whether the card is revealed to other players or not
 * @faceUp whether the card is facing up or not
 */
export interface IPutInHandVerb extends Omit<GenericVerb, "positionX" | "positionY"  > {
    type: CardVerbTypes.PUT_IN_HAND
    revealed: boolean
    faceUp: boolean
}

/**
 * @clientId client who is grabbing the card
 * @grabFrom the clients hand where the card is grabbed from
 * @position where the card should be positioned when grabbed
 * @grabbedAt where card is grabbed
 * @etityId the card being grabbed
 * @faceUp whether the card is facing up or not
 */
export interface IGrabFromHandVerb extends GenericVerb {
    type: CardVerbTypes.GRAB_FROM_HAND
    grabbedAtX: number,
    grabbedAtY: number,
    grabbedFrom: string
    faceUp: boolean
}

/**
 * @position where the card will be placed
 * @clientId the client who is grabbing the card
 * @entityId the card being placed on the table
 * @faceUp whether the card is facing up or not
 */
export interface IPutOnTable extends GenericVerb {
    type: CardVerbTypes.PUT_ON_TABLE
    faceUp:boolean
}