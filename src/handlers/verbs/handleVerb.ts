import { GameState } from "../../types/dataModelDefinitions";
import { Verb, SharedVerbTypes, DeckVerbTypes, CardVerbTypes } from "../../types/verbTypes";
import {handleGrab, handleMove, handleRelease, handleRemove, handleMoveTo} from './shared';
import {handleDrawFaceUp, handleReset} from './deck'
import {handlePutInHand, handleGrabFromHand} from './card'


export function handleVerb(gameState: GameState, verb: Verb){
    switch(verb.type){
        case SharedVerbTypes.GRAB_FROM_TABLE:
            return handleGrab(gameState, verb);
        case SharedVerbTypes.RELEASE:
            return handleRelease(gameState, verb);
        case SharedVerbTypes.MOVE:
            return handleMove(gameState, verb);
        case SharedVerbTypes.REMOVE:
            return handleRemove(gameState, verb);
        case SharedVerbTypes.MOVE_TO:
            return handleMoveTo(gameState, verb);
        case DeckVerbTypes.DRAW_FACE_UP:
            return handleDrawFaceUp(gameState, verb);
        case DeckVerbTypes.RESET:
            return handleReset(gameState, verb);
        case CardVerbTypes.PUT_IN_HAND:
            return handlePutInHand(gameState, verb);
        case CardVerbTypes.GRAB_FROM_HAND:
            return handleGrabFromHand(gameState, verb);
        default:
            return gameState;
    }
}