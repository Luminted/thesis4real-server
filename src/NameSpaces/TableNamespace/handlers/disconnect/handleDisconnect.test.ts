import assert from 'assert';
import { TableClientEvents } from "../../../../types/socketTypes";
import { handleDisconnect } from "./handleDisconnect";
import { GameState, ClientHand, Client } from "../../../../types/dataModelDefinitions";
import { extractEmptySeats } from "../../../../extractors/gameStateExtractors";
import produce from "immer";
import { initialGameState } from "../../../../mocks/initialGameState";
import { clientFactory, clientHandFactory } from "../../../../factories";

describe(`Event handler for: ${TableClientEvents.DISCONNECT}`, function(){
    const socketId = 'client-1'
    let gameState: GameState;
    let client: Client;
    let hand: ClientHand;

    beforeEach(() => {
        client = clientFactory(socketId);
        hand = clientHandFactory(socketId);
        gameState = produce(initialGameState, draft => {
            const nextSeat = draft.emptySeats.shift();
            client = clientFactory(socketId, nextSeat);
            hand = clientHandFactory(socketId);
            client.clientInfo.seatedAt = nextSeat;
            draft.clients.set(client.clientInfo.clientId, client);
            draft.hands.set(hand.clientId, hand);
        })
    })

    it('should add clients seat back into empty seats', function(){
        const clientSeat = client.clientInfo.seatedAt;
        const nextState = handleDisconnect(gameState, socketId);
        const emptySeats = extractEmptySeats(nextState);  
        assert.equal(emptySeats.includes(clientSeat), true);
    })
    it('should remove client', function(){
        const nextState = handleDisconnect(gameState, socketId);
        assert.equal(nextState.clients.has(client.clientInfo.clientId), false);
    })
    it('should remive clients hand', function(){
        const nextState = handleDisconnect(gameState, socketId);
        assert.equal(nextState.hands.has(hand.clientId), false);
    })
})