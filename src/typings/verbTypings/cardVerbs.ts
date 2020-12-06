import {IGenericVerb} from "./index";

export enum ECardVerbTypes {
    ADD_CARD = 'ADD_CARD',
    FLIP = 'FLIP',
    PUT_IN_HAND = 'PUT_IN_HAND',
    GRAB_FROM_HAND = 'GRAB_FROM_HAND',
    REORDER_HAND = "REORDER_HAND"
}

/**
 * @position refers to where new card will be placed
 * @faceUp whether the card should be facing up or not
 * @rotation card will be placed at this rotation
 * @metadata client specific info of card
 */
export interface IAddCardVerb extends Omit<IGenericVerb, "clientId" | "entityId" > {
    type: ECardVerbTypes.ADD_CARD
    faceUp: boolean
    rotation: number
    metadata?: object
}

/**
 * @entityId card being flipped
 */
export interface IFlipVerb extends Omit<IGenericVerb, "clientId" | "positionX" | "positionY" > {
    type: ECardVerbTypes.FLIP
}

/**
 * @clientId the client whoes hand the card is placed in
 * @entityId the card being put in hand
 * @faceUp whether the card is facing up or not
 */
export interface IPutInHandVerb extends Omit<IGenericVerb, "positionX" | "positionY"  > {
    type: ECardVerbTypes.PUT_IN_HAND
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
export interface IGrabFromHandVerb extends IGenericVerb {
    type: ECardVerbTypes.GRAB_FROM_HAND
    grabbedAtX: number,
    grabbedAtY: number,
    grabbedFrom: string
    faceUp: boolean
}

/**
 * @clientId the client that's hand is going to be reordered
 * @order the new ordering of the hand
 */
export interface IReorderHandVerb extends Omit<IGenericVerb, "entityId" | "positionX" | "positionY"> {
    type: ECardVerbTypes.REORDER_HAND
    order: number[]
}