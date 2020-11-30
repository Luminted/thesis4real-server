import assert from 'assert';
import { CardVerbTypes, IPutOnTableVerb } from '../../../../types/verb';
import { extractCardById, extractGrabbedEntityOfClientById, extractClientHandById, extractCardFromClientHandById } from '../../../../extractors/gameStateExtractors';
import { mockClient1 } from '../../../../mocks/clientMocks';
import { CardVerbHandler } from '../CardVerbHandler';
import { Container } from 'typescript-ioc';
import { TableStateStore } from '../../../../stores/TableStateStore/TableStateStore';
import { handCardMock1, handCardMock2 } from '../../../../mocks/entityMocks';
import { TableHandler } from '../../../Table';

describe(`handle ${CardVerbTypes.PUT_ON_TABLE} verb`, function() {
    const cardVerbHandler = new CardVerbHandler();
    const tableHandler = new TableHandler();
    const gameStateStore = Container.get(TableStateStore).state.gameStateStore;
    const {clientInfo: {clientId}} = mockClient1;
    const {entityId} = handCardMock1;
    let verb: IPutOnTableVerb;

    beforeEach('Setting up test data...', () => {
        verb = {
            clientId: clientId,
            entityId: entityId,
            positionX: 99,
            positionY: 66,
            faceUp: true,
            type: CardVerbTypes.PUT_ON_TABLE
        };
        gameStateStore.resetState();
        gameStateStore.changeState(draft => {
            const hand = tableHandler.createClientHand(clientId)
            draft.clients.set(clientId, {...mockClient1});
            hand.cards.push({...handCardMock1});
            hand.ordering.push(0);
            draft.hands.set(clientId, hand);
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

    it('should put card with face up according to verb', () => {
        const nextGameState = cardVerbHandler.putOnTable(verb);

        let cardOnTable = extractCardById(nextGameState, entityId);
        assert.equal(cardOnTable.faceUp, verb.faceUp);
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
    it('should update hand ordering', () => {
        gameStateStore.changeState(draft => {
            const handDraft = extractClientHandById(draft ,clientId);
            handDraft.cards.push({...handCardMock2}, {...handCardMock1});
            handDraft.ordering.push(2,1);
        })

        const {entityId} = handCardMock2;
        const nextGameState = cardVerbHandler.putOnTable({...verb, entityId});

        const {ordering} = extractClientHandById(nextGameState, clientId);
        assert.deepEqual(ordering, [0,1]);
    })
    
})