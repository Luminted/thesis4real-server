import * as assert from 'assert';
import { CardVerbTypes, CardVerb } from '../../../../types/verbTypes';
import { EntityTypes, CardTypes, CardRepresentation } from '../../../../types/dataModelDefinitions';
import { deckFactory, clientHandFactory, cardRepFactory } from '../../../../factories';
import { extractCardById, extractGrabbedEntityOfClientById, extractClientHandById, extractCardFromClientHandById } from '../../../../extractors/gameStateExtractors';
import { client1 } from '../../../../mocks/client';
import { CardVerbHandler } from '../CardVerbHandler';
import { Container } from 'typescript-ioc';
import { TableStateStore } from '../../../../stores/TableStateStore/TableStateStore';

describe(`handle ${CardVerbTypes.PUT_ON_TABLE} verb`, function() {
    const cardVerbHandler = new CardVerbHandler();
    const gameStateStore = Container.get(TableStateStore).state.gameStateStore;
    const client = client1;
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
        const nextGameState = cardVerbHandler.putOnTable(verb);
        let cardOnTable = extractCardById(nextGameState, cardToPutOnTable.entityId);
        assert.notEqual(cardOnTable, undefined);
    });

    it('should put it on the given position', function(){
        const nextGameState = cardVerbHandler.putOnTable(verb);
        let cardOnTable = extractCardById(nextGameState, cardToPutOnTable.entityId);
        assert.equal(cardOnTable.positionX, verb.positionX);
        assert.equal(cardOnTable.positionY, verb.positionY);
    })

    it('should remove card from hand of correct client', function() {
        const nextGameState = cardVerbHandler.putOnTable(verb);
        let nextHand = extractClientHandById(nextGameState, client.clientInfo.clientId);
        assert.notEqual(nextHand.cards.find(card => card.entityId === cardToPutOnTable.entityId), undefined);
    })

    it('should set grabbed entity to null', function(){
        const nextGameState = cardVerbHandler.putOnTable(verb);
        let grabbedEntity = extractGrabbedEntityOfClientById(nextGameState, client.clientInfo.clientId);
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

        const nextGameState = cardVerbHandler.putOnTable(verb);
        assert.deepEqual(nextGameState, originalState);
    })
    
})