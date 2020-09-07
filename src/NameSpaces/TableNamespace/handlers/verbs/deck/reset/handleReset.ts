import { DeckVerb } from '../../../../../../types/verbTypes'
import { GameState } from '../../../../../../types/dataModelDefinitions';
import { extractDeckById } from '../../../../../../extractors/gameStateExtractors';

export function handleReset(draft: GameState, verb: DeckVerb) {
    const {entityId } = verb;
    const deck = extractDeckById(draft, entityId);
    // TODO: nested interation needs to be optimized
    //removing from table
    deck.drawIndex = 0;
    draft.cards.forEach(card => {
        if(card.ownerDeck === entityId){
            draft.cards.delete(card.entityId);
        }
    })

    //removing from hands
    draft.hands.forEach(hand => {
        const {clientId} = hand;
        hand.cards = draft.hands.get(clientId).cards.filter(card => card.ownerDeck !== entityId);
        })

    //removing greabbed cards
    draft.clients.forEach(client => {
        const {grabbedEntitiy} = client;
        if(grabbedEntitiy && grabbedEntitiy.entityId === entityId){
            client.grabbedEntitiy = null;
        }
    })

}