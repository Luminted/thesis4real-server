import { GameState } from "../.././types/dataModelDefinitions";
import { Verb, SharedVerbTypes, DeckVerbTypes } from "../.././types/verbTypes";
import {handleGrab, handleMove, handleRelease, handleRemove} from './shared';
import {handleDrawFaceUp, handleReset} from './deck'


export function handleVerb(state: GameState, verb: Verb){
    switch(verb.type){
        case SharedVerbTypes.GRAB:
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
        default:
            return state;
    }
}