import assert from 'assert';
import { TableModuleClientEvents } from "../../../../types/sockeTypes";
import { handleDisconnect } from "./handleDisconnect";
import { GameState, ClientHand, Client } from "../../../../types/dataModelDefinitions";
import { extractEmptySeats } from "../../../../extractors/gameStateExtractors";
import produce from "immer";
import { initialGameState } from "../../../../__mocks__/initialGameState";
import { clientFactory, clientHandFactory } from "../../../../factories";

describe(`Event handler for: ${TableModuleClientEvents.DISCONNECT}`, function(){
    const socketId = 'client-1'
    let gameState: GameState;
    let client: Client;
    let hand: ClientHand;

    this.beforeEach(() => {
        client = clientFactory(socketId);
        hand = clientHandFactory(socketId);
        gameState = produce(initialGameState, draft => {
            const nextSeat = draft.emptySeats.shift();
            client = clientFactory(socketId, nextSeat);
            hand = clientHandFactory(socketId);
            client.clientInfo.seatedAt = nextSeat;
            draft.clients.push(client);
            draft.hands.push(hand);
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
        assert.equal(nextState.clients.some(c => c.clientInfo.clientId === client.clientInfo.clientId), false);
    })
    it('should remive clients hand', function(){
        const nextState = handleDisconnect(gameState, socketId);
        assert.equal(nextState.hands.some(h => h.clientId === hand.clientId), false);
    })
})