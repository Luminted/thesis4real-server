import assert from 'assert';
import { Container } from 'typescript-ioc';
import { createClientHand } from "../../../factories";
import { extractClientById, extractClientHandById, extractCardById } from '../../../extractors/gameStateExtractors';
import { mockClient1 } from '../../../mocks/clientMocks';
import { TableHandler } from '../TableHandler';
import { TableStateStore } from '../../../stores/TableStateStore/TableStateStore';
import { TableClientEvents } from '../../../types/socketTypes';
import { cardEntityMock1, handCardMock1, handCardMock2 } from '../../../mocks/entityMocks';

describe(`Testing ${TableClientEvents.LEAVE_TABLE}`, function(){
    const tableHandler = new TableHandler();
    const tableStateStore = Container.get(TableStateStore)
    const gameStateStore = tableStateStore.state.gameStateStore;
    const {clientInfo: { clientId }} = mockClient1;
    const cardInClientsHand1 = {...handCardMock1}
    const cardInClientsHand2 = {...handCardMock2};
    const defaultPosition: [number, number] = [15,25];

    beforeEach(() => {
        gameStateStore.resetState();
        tableStateStore.resetState();
        gameStateStore.changeState(draft => {
            const clientHand = createClientHand(clientId);
            clientHand.cards.push(cardInClientsHand1, cardInClientsHand2);
            draft.clients.set(clientId, {...mockClient1});
            draft.hands.set(clientId, clientHand);
        });
        tableStateStore.changeState(draft => {
            draft.defaultPosition = defaultPosition;
        })
    })

    it('should remove client from clients', function(){
        const nextGameState = tableHandler.leaveTable(clientId);

        const removedClient = extractClientById(nextGameState, clientId);
        assert.equal(removedClient, null);
    });
    it('should remove clients hand', function(){
        const nextGameState = tableHandler.leaveTable(clientId);

        const removedHand = extractClientHandById(nextGameState, clientId);
        assert.equal(removedHand, null);
    })
    it('should put cards in clients hand on table at default point', function(){
        const nextGameState = tableHandler.leaveTable(clientId);

        const cardPutBackOnTable1 = extractCardById(nextGameState, cardInClientsHand1.entityId);
        const cardPutBackOnTable2 = extractCardById(nextGameState, cardInClientsHand2.entityId);
        assert.equal(cardPutBackOnTable1.positionX, defaultPosition[0]);
        assert.equal(cardPutBackOnTable1.positionY, defaultPosition[1]);
        assert.equal(cardPutBackOnTable2.positionX, defaultPosition[0]);
        assert.equal(cardPutBackOnTable2.positionY, defaultPosition[1]);
    });

    it('should put cards from hand on top of cards on table', function(){
        const entityOnTable = {...cardEntityMock1}
        gameStateStore.changeState(draft => {
            entityOnTable.zIndex = draft.topZIndex;
            draft.cards.set(entityOnTable.entityId, entityOnTable);
        })
        const nextGameState = tableHandler.leaveTable(clientId);

        const nextEntityOnTable = extractCardById(nextGameState, entityOnTable.entityId);
        const cardPutBackOnTable1 = extractCardById(nextGameState, cardInClientsHand1.entityId);
        const cardPutBackOnTable2 = extractCardById(nextGameState, cardInClientsHand2.entityId);
        assert.equal(cardPutBackOnTable1.zIndex > nextEntityOnTable.zIndex, true);
        assert.equal(cardPutBackOnTable2.zIndex > nextEntityOnTable.zIndex, true);
    })
   
    it('should put clients seat back to empty seats', function(){
        const clientsSeat = mockClient1.clientInfo.seatId;
       tableStateStore.changeState(draft => {
            draft.emptySeats = [];
        }),
        tableHandler.leaveTable(clientId);

        assert.equal(tableStateStore.state.emptySeats.includes(clientsSeat), true);
    })
})