import assert from 'assert';
import { CardVerbTypes, CardVerb } from '../../../../types/verbTypes';
import { EntityTypes } from '../../../../types/dataModelDefinitions';
import { createClientHand } from '../../../../factories';
import { extractCardById, extractGrabbedEntityOfClientById, extractClientHandById, extractCardFromClientHandById } from '../../../../extractors/gameStateExtractors';
import { mockClient1 } from '../../../../mocks/clientMocks';
import { CardVerbHandler } from '../CardVerbHandler';
import { Container } from 'typescript-ioc';
import { TableStateStore } from '../../../../stores/TableStateStore/TableStateStore';
import { handCardMock1 } from '../../../../mocks/entityMocks';

describe(`handle ${CardVerbTypes.PUT_ON_TABLE} verb`, function() {
    const cardVerbHandler = new CardVerbHandler();
    const gameStateStore = Container.get(TableStateStore).state.gameStateStore;
    const {clientInfo: {clientId}} = mockClient1;
    const {entityId} = handCardMock1;
    let verb: CardVerb;

    beforeEach('Setting up test data...', () => {
        verb = {
            clientId: clientId,
            entityId: entityId,
            entityType: EntityTypes.CARD,
            positionX: 99,
            positionY: 66,
            type: CardVerbTypes.PUT_ON_TABLE
        };
        gameStateStore.resetState();
        gameStateStore.changeState(draft => {
            draft.clients.set(clientId, {...mockClient1});
            draft.hands.set(clientId, createClientHand(clientId));
            draft.hands.get(clientId).cards.push({...handCardMock1});
        })
    })

    it('should add card to cards array', function(){
        const nextGameState = cardVerbHandler.putOnTable(verb);
        let cardOnTable = extractCardById(nextGameState, entityId);
        assert.notEqual(cardOnTable, undefined);
    });

    it('should put it on the given position', function(){
        const nextGameState = cardVerbHandler.putOnTable(verb);
        let cardOnTable = extractCardById(nextGameState, entityId);
        assert.equal(cardOnTable.positionX, verb.positionX);
        assert.equal(cardOnTable.positionY, verb.positionY);
    })

    it('should remove card from hand of correct client', function() {
        const nextGameState = cardVerbHandler.putOnTable(verb);
        let nextHand = extractClientHandById(nextGameState, clientId);
        assert.notEqual(nextHand.cards.find(card => card.entityId === entityId), undefined);
    })

    it('should set grabbed entity to null', function(){
        const nextGameState = cardVerbHandler.putOnTable(verb);
        let grabbedEntity = extractGrabbedEntityOfClientById(nextGameState, clientId);
        assert.equal(grabbedEntity, null);
    })
    
})