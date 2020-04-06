import { GameState } from "../.././types/dataModelDefinitions";
import { Verb, SharedVerbTypes, DeckVerbTypes, CardVerbTypes } from "../.././types/verbTypes";
import {handleGrab, handleMove, handleRelease, handleRemove} from './shared';
import {handleDrawFaceUp, handleReset} from './deck'
import {handlePutInHand, handleGrabFromHand} from './card'


export function handleVerb(state: GameState, verb: Verb){
    switch(verb.type){
        case SharedVerbTypes.GRAB_FROM_TABLE:
            return handleGrab(state, verb);
        case SharedVerbTypes.RELEASE:
            return handleRelease(state, verb);
        case SharedVerbTypes.MOVE:
            return handleMove(state, verb);
        case SharedVerbTypes.REMOVE:
            return handleRemove(state, verb);
        case DeckVerbTypes.DRAW_FACE_UP:
            return handleDrawFaceUp(state, verb);
        case DeckVerbTypes.RESET:
            return handleReset(state, verb);
        case CardVerbTypes.PUT_IN_HAND:
            return handlePutInHand(state, verb);
        case CardVerbTypes.GRAB_FROM_HAND:
            return handleGrabFromHand(state, verb);
        default:
            return state;
    }
}