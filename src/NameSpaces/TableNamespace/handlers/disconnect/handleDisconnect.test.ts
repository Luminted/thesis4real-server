import assert from 'assert';
import { TableClientEvents } from "../../../../types/socketTypes";
import { handleDisconnect } from "./handleDisconnect";
import { ClientHand, Client } from "../../../../types/dataModelDefinitions";
import { extractEmptySeats } from "../../../../extractors/gameStateExtractors";
import { clientHandFactory } from "../../../../factories";
import { createClient } from '../../../../mocks/client';
import { GameStateStore } from '../../../../Store/GameStateStore';

describe(`Event handler for: ${TableClientEvents.DISCONNECT}`, function(){
    let gameStateStore = new GameStateStore();
    const socketId = 'client-1'
    let client: Client;
    let hand: ClientHand;

    beforeEach(() => {
        hand = clientHandFactory(socketId);
        gameStateStore.resetState();
        gameStateStore.changeState(draft => {
            const nextSeat = draft.emptySeats.shift();
            client = createClient(socketId, nextSeat);
            hand = clientHandFactory(socketId);
            client.clientInfo.seatedAt = nextSeat;
            draft.clients.set(client.clientInfo.clientId, client);
            draft.hands.set(hand.clientId, hand);
        })
    })

    it('should add clients seat back into empty seats', function(){
        const clientSeat = client.clientInfo.seatedAt;
       gameStateStore.changeState(draft => handleDisconnect(draft, socketId));
        const emptySeats = extractEmptySeats(gameStateStore.state);  
        assert.equal(emptySeats.includes(clientSeat), true);
    })
    it('should remove client', function(){
       gameStateStore.changeState(draft => handleDisconnect(draft, socketId));
        assert.equal(gameStateStore.state.clients.has(client.clientInfo.clientId), false);
    })
    it('should remive clients hand', function(){
       gameStateStore.changeState(draft => handleDisconnect(draft, socketId));
        assert.equal(gameStateStore.state.hands.has(hand.clientId), false);
    })
})