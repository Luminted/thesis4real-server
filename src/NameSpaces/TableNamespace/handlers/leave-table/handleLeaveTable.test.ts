import assert from 'assert';
import { CardTypes } from "../../../../types/dataModelDefinitions";
import {Seats} from '../../../../types/dataModelDefinitions';
import { cardFactory, cardRepFactory, clientHandFactory } from "../../../../factories";
import { handleLeaveTable } from "./handleLeaveTable";
import { extractClientById, extractClientHandById, extractCardById } from '../../../../extractors/gameStateExtractors';
import { createClient } from '../../../../mocks/client';
import { GameStateStore } from '../../../../Store/GameStateStore';

describe('Testing handleLeaveTable', function(){

    const clientId = 'client-1';
    const client = createClient(clientId, Seats.NORTH);
    const cardInClientsHand1 = cardRepFactory(CardTypes.FRENCH, 'dummy');
    const cardInClientsHand2 = cardRepFactory(CardTypes.FRENCH, 'dummy');
    const defaultPosition: [number, number] = [15,25];
    let gameStateStore = new GameStateStore();

    beforeEach(() => {
        gameStateStore.resetState();
        gameStateStore.changeState(draft => {
            const clientHand = clientHandFactory(clientId);
            clientHand.cards.push(cardInClientsHand1, cardInClientsHand2);
            draft.clients.set(clientId, client);
            draft.hands.set(clientId, clientHand);
        })
    })

    it('should remove client from clients', function(){
        gameStateStore.changeState(draft => handleLeaveTable(draft, clientId, defaultPosition));
        const removedClient = extractClientById(gameStateStore.state, clientId);
        assert.equal(removedClient, null);
    });
    it('should remove clients hand', function(){
        gameStateStore.changeState(draft => handleLeaveTable(draft, clientId, defaultPosition));
        const removedHand = extractClientHandById(gameStateStore.state, clientId);
        assert.equal(removedHand, null);
    })
    it('should put cards in clients hand on table at default point', function(){
        gameStateStore.changeState(draft => handleLeaveTable(draft, clientId, defaultPosition));
        const cardPutBackOnTable1 = extractCardById(gameStateStore.state, cardInClientsHand1.entityId);
        const cardPutBackOnTable2 = extractCardById(gameStateStore.state, cardInClientsHand2.entityId);
        assert.equal(cardPutBackOnTable1.positionX, defaultPosition[0]);
        assert.equal(cardPutBackOnTable1.positionY, defaultPosition[1]);
        assert.equal(cardPutBackOnTable2.positionX, defaultPosition[0]);
        assert.equal(cardPutBackOnTable2.positionY, defaultPosition[1]);
    });

    it('should put cards from hand on top of cards on table', function(){
        const entityOnTable = cardFactory(0,0,CardTypes.FRENCH);
        gameStateStore.changeState(draft => {
            entityOnTable.zIndex = draft.topZIndex;
            draft.cards.set(entityOnTable.entityId, entityOnTable);
        })
        gameStateStore.changeState(draft => handleLeaveTable(draft, clientId, defaultPosition));
        const nextEntityOnTable = extractCardById(gameStateStore.state, entityOnTable.entityId);
        const cardPutBackOnTable1 = extractCardById(gameStateStore.state, cardInClientsHand1.entityId);
        const cardPutBackOnTable2 = extractCardById(gameStateStore.state, cardInClientsHand2.entityId);
        assert.equal(cardPutBackOnTable1.zIndex > nextEntityOnTable.zIndex, true);
        assert.equal(cardPutBackOnTable2.zIndex > nextEntityOnTable.zIndex, true);
    })
   
    it('should put clients seat back to empty seats', function(){
        const clientsSeat = client.clientInfo.seatedAt;
       gameStateStore.changeState(draft => {
            draft.emptySeats = [];
        })
        gameStateStore.changeState(draft => handleLeaveTable(draft, clientId, defaultPosition));
        assert.equal(gameStateStore.state.emptySeats.includes(clientsSeat), true);
    })
})