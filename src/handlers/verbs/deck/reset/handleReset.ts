import produce from 'immer';

import { DeckVerb } from '../../../../../../common/verbTypes'
import { GameState } from '../../../../../../common/dataModelDefinitions';

export function handleReset(state: GameState, verb: DeckVerb): GameState {
    return produce(state, draft => {
        const {entityId } = verb;
        draft.cards = state.cards.filter(c => c.ownerDeck !== entityId)
    })
}