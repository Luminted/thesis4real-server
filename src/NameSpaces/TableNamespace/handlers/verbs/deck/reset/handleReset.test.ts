import * as assert from 'assert';
import {client1, client2} from '../../../../../../mocks/client';
import { DeckVerbTypes, DeckVerb } from '../../../../../../types/verbTypes';
import { EntityTypes, CardTypes } from '../../../../../../types/dataModelDefinitions';
import { cardFactory, deckFactory, clientHandFactory } from '../../../../../../factories';
import {handleReset} from './handleReset'
import { extractDeckById, extractClientHandById } from '../../../../../../extractors/gameStateExtractors';
import { GameStateStore } from '../../../../../../Store/GameStateStore';


describe(`handle ${DeckVerbTypes.RESET} verb`, function() {
    let gameStateStore = new GameStateStore();
    const deckToReset = deckFactory(CardTypes.FRENCH,100,100);
    deckToReset.drawIndex = 5;
    const client1Card = cardFactory(0,0,CardTypes.FRENCH,undefined,undefined,undefined,deckToReset.entityId);
    const client2Card = cardFactory(0,0,CardTypes.FRENCH,undefined,undefined,undefined,deckToReset.entityId);
    const verbType = DeckVerbTypes.RESET;
    const cardsBelongingToDeck = [cardFactory(0,0,CardTypes.FRENCH,undefined, undefined, undefined, deckToReset.entityId), cardFactory(0,100, CardTypes.FRENCH, undefined, undefined, undefined, deckToReset.entityId)]
    const verb: DeckVerb = {
        type: verbType,
        clientId: client1.clientInfo.clientId,
        positionX: 0,
        positionY: 0,
        entityId: deckToReset.entityId,
        entityType: EntityTypes.DECK
    }

    beforeEach('Setting up test data...', () => {
        const client1Id = client1.clientInfo.clientId;
        const client2Id = client2.clientInfo.clientId;
        
        gameStateStore.resetState();
        gameStateStore.changeState(draft => {
            cardsBelongingToDeck.forEach((card => {
                draft.cards.set(card.entityId, card);
            }))
            draft.decks.set(deckToReset.entityId, deckToReset);
            draft.clients.set(client1Id, client1);
            draft.clients.set(client2Id, client2);
            draft.hands.set(client1Id, clientHandFactory(client1Id));
            draft.hands.set(client2Id, clientHandFactory(client2Id));
            draft.hands.get(client1Id).cards.push(client1Card);
            draft.hands.get(client2Id).cards.push(client2Card);
        })
    })

    it('should remove all cards off the table belonging to the reset deck', function() {
        gameStateStore.changeState(draft => handleReset(draft, verb));
        for(const card of cardsBelongingToDeck){
            assert.equal(gameStateStore.state.cards.has(card.entityId), false);
        }
    })

    it('should remove grabbed cards belonging to the reset deck', function(){
        const grabbedCard = cardFactory(0,0,CardTypes.FRENCH, undefined, undefined, undefined, deckToReset.entityId)
       gameStateStore.changeState(draft => {
            const {entityId, entityType} = grabbedCard; 
            draft.clients.get(client1.clientInfo.clientId).grabbedEntitiy = {
                entityType,
                entityId,
                grabbedAtX: 0,
                grabbedAtY: 0
            };
        })
        gameStateStore.changeState(draft => handleReset(draft, verb));
        let isRemoved = true;
        gameStateStore.state.clients.forEach(client => {
            const {grabbedEntitiy} = client;
            if(grabbedEntitiy){
                isRemoved = isRemoved && grabbedEntitiy.entityId !== deckToReset.entityId
            }
        })
        assert.equal(isRemoved, true);
    })

    it('should remove all card out of player hands belonging to the reset deck', function(){
        gameStateStore.changeState(draft => handleReset(draft, verb));
        assert.equal(extractClientHandById(gameStateStore.state, client1.clientInfo.clientId).cards.some(card => card.entityId === client1Card.entityId), false);
        assert.equal(extractClientHandById(gameStateStore.state, client2.clientInfo.clientId).cards.some(card => card.entityId === client2Card.entityId), false);
    })
    it('should drawIndex to 0', function(){
        gameStateStore.changeState(draft => handleReset(draft, verb));
        const resetDeck = extractDeckById(gameStateStore.state, deckToReset.entityId);
        assert.equal(resetDeck.drawIndex, 0);
    })

})