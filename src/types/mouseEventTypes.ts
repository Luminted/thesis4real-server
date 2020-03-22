import {EntityTypes} from './dataModelDefinitions'
import {MaybeNull} from './genericTypes'

export enum MouseInputTypes {
    LEFT_BUTTON_DOWN= 'LEFT_BUTTON_DOWN',
    LEFT_BUTTON_UP= 'LEFT_BUTTON_UP',
    CTRL_LEFT_BUTTON_DOWN= 'CTRL_LEFT_BUTTON_DOWN',
    CTRL_LEFT_BUTTON_UP = 'CTRL_LEFT_BUTTON_UP',

    RIGHT_BUTTON_DOWN = 'RIGHT_BUTTON_DOWN',
    RIGHT_BUTTON_UP = 'RIGHT_BUTTON_UP',
    CTRL_RIGHT_BUTTON_DOWN = 'CTRL_RIGHT_BUTTON_DOWN',
    CTRL_RIGHT_BUTTON_UP = 'CTRL_RIGHT_BUTTON_UP',

    MOUSE_MOVE= 'MOUSE_MOVE',

    UNKNOWN_INPUT= 'UNKOWN_INPUT'
}

export interface MouseInput {
    type: MouseInputTypes,
    entityId:MaybeNull<string>,
    entityType: MaybeNull<string>,
    clientId: string,
    cursorX: number,
    cursorY: number
}