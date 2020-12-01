import { IGenericVerb } from ".";
import { EEntityTypes } from "../gameStateTypings";

export enum ESharedVerbTypes {
    GRAB = 'GRAB',
    MOVE = 'MOVE',
    RELEASE = 'RELEASE',
    REMOVE = 'REMOVE',
    MOVE_TO = 'MOVE_TO',
    ROTATE = "ROTATE"
}

/**
 * @entityType used for lookup
 */
interface ISharedVerb extends IGenericVerb {
    entityType: EEntityTypes
}

/**
 * @position grabbedAt will be set to this position
 * @clientId client who is grabbing the entity
 * @entityId entity being grabbed
 */
export interface IGrabVerb extends ISharedVerb {
    type: ESharedVerbTypes.GRAB
}

/**
 * @position where the cursor is currently
 * @clientId client who is moving entity
 */
export interface IMoveVerb extends Omit<ISharedVerb, "entityType" | "entityId"> {
    type: ESharedVerbTypes.MOVE
}

/**
 * @clientId client who is releasing the entity
 */
export interface IReleaseVerb extends Omit<ISharedVerb, "positionX" | "positionY"> {
    type: ESharedVerbTypes.RELEASE
}

/**
 * @entityId entity being removed
 */
export interface IRemoveVerb extends Omit<ISharedVerb, "positionX" | "positionY" | "clientId"> {
    type: ESharedVerbTypes.REMOVE
}

/**
 * @position new position of entity
 * @entityId entity being moved

 */
export interface IMoveToVerb extends Omit<ISharedVerb, "clientId"> {
    type: ESharedVerbTypes.MOVE_TO
}

/**
 * @entityId the entity being rotated
 * @angle the amount it is rotated by
 */
export interface IRotateVerb extends Omit<ISharedVerb, "positionX" | "positionY" | "clientId" > {
    type: ESharedVerbTypes.ROTATE
    angle: number
}