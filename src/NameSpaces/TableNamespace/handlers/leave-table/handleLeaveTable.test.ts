import assert from 'assert';
import { GameState, CardTypes } from "../../../../types/dataModelDefinitions";
import {Seats} from '../../../../types/dataModelDefinitions';
import { clientFactory, cardFactory, cardRepFactory, clientHandFactory } from "../../../../factories";
import produce, { enableMapSet } from "immer";
import { handleLeaveTable } from "./handleLeaveTable";
import { extractClientById, extractClientHandById, extractCardById } from '../../../../extractors/gameStateExtractors';
import { initialGameState } from '../../../../mocks/initialGameState';

describe('Testing handleLeaveTable', function(){
    // Enabling Map support for Immer
    enableMapSet();

    const clientId = 'client-1'
    const client = clientFactory(clientId, Seats.NORTH);
    const cardInClientsHand1 = cardRepFactory(CardTypes.FRENCH, 'dummy');
    const cardInClientsHand2 = cardRepFactory(CardTypes.FRENCH, 'dummy');
    const defaultPosition: [number, number] = [15,25];
    let gameState: GameState;

    beforeEach(() => {
        gameState = produce(initialGameState, draft => {
            const clientHand = clientHandFactory(clientId);
            clientHand.cards.push(cardInClientsHand1, cardInClientsHand2);
            draft.clients.set(clientId, client);
            draft.hands.set(clientId, clientHand);
        })
    })

    it('should remove client from clients', function(){
        const nextGameState = handleLeaveTable(gameState, clientId, defaultPosition);
        const removedClient = extractClientById(nextGameState, clientId);
        assert.equal(removedClient, null);
    });
    it('should remove clients hand', function(){
        const nextGameState = handleLeaveTable(gameState, clientId, defaultPosition);
        const removedHand = extractClientHandById(nextGameState, clientId);
        assert.equal(removedHand, null);
    })
    it('should put cards in clients hand on table at default point', function(){
        const nextGameState = handleLeaveTable(gameState, clientId, defaultPosition);
        const cardPutBackOnTable1 = extractCardById(nextGameState, cardInClientsHand1.entityId);
        const cardPutBackOnTable2 = extractCardById(nextGameState, cardInClientsHand2.entityId);
        assert.equal(cardPutBackOnTable1.positionX, defaultPosition[0]);
        assert.equal(cardPutBackOnTable1.positionY, defaultPosition[1]);
        assert.equal(cardPutBackOnTable2.positionX, defaultPosition[0]);
        assert.equal(cardPutBackOnTable2.positionY, defaultPosition[1]);
    });

    it('should put cards from hand on top of cards on table', function(){
        const entityOnTable = cardFactory(0,0,CardTypes.FRENCH);
        gameState = produce(gameState, draft => {
            entityOnTable.zIndex = gameState.topZIndex;
            draft.cards.set(entityOnTable.entityId, entityOnTable);
        })
        const nextGameState = handleLeaveTable(gameState, clientId, defaultPosition);
        const nextEntityOnTable = extractCardById(nextGameState, entityOnTable.entityId);
        const cardPutBackOnTable1 = extractCardById(nextGameState, cardInClientsHand1.entityId);
        const cardPutBackOnTable2 = extractCardById(nextGameState, cardInClientsHand2.entityId);
        assert.equal(cardPutBackOnTable1.zIndex > nextEntityOnTable.zIndex, true);
        assert.equal(cardPutBackOnTable2.zIndex > nextEntityOnTable.zIndex, true);
    })
   
    it('should put clients seat back to empty seats', function(){
        const clientsSeat = client.clientInfo.seatedAt;
        gameState = produce(gameState, draft => {
            draft.emptySeats = [];
        })
        const nextGameState = handleLeaveTable(gameState, clientId, defaultPosition);
        assert.equal(nextGameState.emptySeats.includes(clientsSeat), true);
    })
})