import * as assert from 'assert';
import {handlePutOnTable} from './handlePutOnTable';
import { CardVerbTypes, CardVerb } from '../../../../../../types/verbTypes';
import { EntityTypes, CardTypes, CardRepresentation } from '../../../../../../types/dataModelDefinitions';
import { deckFactory, clientHandFactory, cardRepFactory } from '../../../../../../factories';
import { extractCardById, extractGrabbedEntityOfClientById, extractClientHandById, extractCardFromClientHandById, extractCardFromDeckById } from '../../../../../../extractors/gameStateExtractors';
import { client1 } from '../../../../../../mocks/client';
import { GameStateStore } from '../../../../../../Store/GameStateStore';

describe(`handle ${CardVerbTypes.PUT_ON_TABLE} verb`, function() {
    let gameStateStore = new GameStateStore();
    let client = client1;
    let cardToPutOnTable: CardRepresentation;
    let verb: CardVerb;

    beforeEach('Setting up test data...', () => {
        const {clientId} = client.clientInfo;
        cardToPutOnTable = cardRepFactory(CardTypes.FRENCH, 'placeholder');
        verb = {
            clientId: client.clientInfo.clientId,
            entityId: cardToPutOnTable.entityId,
            entityType: EntityTypes.CARD,
            positionX: 99,
            positionY: 66,
            type: CardVerbTypes.PUT_ON_TABLE
        };
        gameStateStore.resetState();
        gameStateStore.changeState(draft => {
            draft.clients.set(clientId, client);
            draft.hands.set(clientId, clientHandFactory(client.clientInfo.clientId));
            draft.hands.get(clientId).cards.push(cardToPutOnTable);
        })
    })

    it('should add card to cards array', function(){
        gameStateStore.changeState(draft => handlePutOnTable(draft, verb));
        let cardOnTable = extractCardById(gameStateStore.state, cardToPutOnTable.entityId);
        assert.notEqual(cardOnTable, undefined);
    });

    it('should put it on the given position', function(){
        gameStateStore.changeState(draft => handlePutOnTable(draft, verb));
        let cardOnTable = extractCardById(gameStateStore.state, cardToPutOnTable.entityId);
        assert.equal(cardOnTable.positionX, verb.positionX);
        assert.equal(cardOnTable.positionY, verb.positionY);
    })

    it('should remove card from hand of correct client', function() {
        gameStateStore.changeState(draft => handlePutOnTable(draft, verb));
        let nextHand = extractClientHandById(gameStateStore.state, client.clientInfo.clientId);
        assert.notEqual(nextHand.cards.find(card => card.entityId === cardToPutOnTable.entityId), undefined);
    })

    it('should set grabbed entity to null', function(){
        gameStateStore.changeState(draft => handlePutOnTable(draft, verb));
        let grabbedEntity = extractGrabbedEntityOfClientById(gameStateStore.state, client.clientInfo.clientId);
        assert.equal(grabbedEntity, null);
    })
    it('should do nothing if it exists in a deck also. This is for avoiding duplication caused by concurrency.', function(){
       gameStateStore.changeState(draft => {
            const deck = deckFactory(CardTypes.FRENCH, 0,0);
            deck.cards.push(cardToPutOnTable);
            draft.decks.set(deck.entityId, deck);
            extractCardFromClientHandById(draft, client.clientInfo.clientId, cardToPutOnTable.entityId).ownerDeck = deck.entityId;
        })

        const originalState = {...gameStateStore.state};

        gameStateStore.changeState(draft => handlePutOnTable(draft, verb));
        assert.deepEqual(gameStateStore.state, originalState);
    })
    
})