import * as assert from 'assert'

import { handleGrab } from "./handleGrab";
import { SharedVerbTypes, SharedVerb } from "../../../../../../common/verbTypes";
import { EntityTypes, GameState, Client } from "../../../../../../common/dataModelDefinitions";
import { extractGrabbedEntityOfClientById } from "../../../../extractors";
import { clientFactory, cardFactory, deckFactory } from '../../../../factories';
import produce from 'immer';



describe(`handle ${SharedVerbTypes.GRAB} verb`, function() {

    let initialGameState: GameState = {
        cards: [],
        decks: [],
        clients: []
    };
    let gameState: GameState;
    let client: Client;

    beforeEach('Setting up test data...', () => {
        client = clientFactory();
        gameState = produce(initialGameState, draft => {
            draft.cards = [cardFactory(0,0)]
            draft.decks = [deckFactory(100,100)]
            draft.clients = [client]
        })
    })

    const testedVerbType = SharedVerbTypes.GRAB;
    describe(`EntityType: ${EntityTypes.CARD}`, function(){
        it('Assignes data of clicked card to correct clients grabbedEntity.', function(){
            const {entityId, entityType} = gameState.cards[0];
            const cursorX = 1;
            const cursorY = 2;
            const verb: SharedVerb = {
                type: testedVerbType,
                clientId: client.clientInfo.clientId,
                cursorX,
                cursorY,
                entityId,
                entityType
            }
            const nextState = handleGrab(gameState,verb);
            const grabbedEntity = extractGrabbedEntityOfClientById(nextState, verb.clientId);
            assert.equal(grabbedEntity.entityId, entityId);
            assert.equal(grabbedEntity.grabbedAtX, cursorX);
            assert.equal(grabbedEntity.grabbedAtY, cursorY);
        })
    })

    describe(`EntityType: ${EntityTypes.DECK}`, function(){
        it('Assignes data of clicked card to correct clients grabbedEntity.', function(){
            const {entityType, entityId } = gameState.decks[0]
            const cursorX = 1;
            const cursorY = 2;
            const verb: SharedVerb = {
                type: testedVerbType,
                clientId: client.clientInfo.clientId,
                cursorX,
                cursorY,
                entityId,
                entityType
            }
            const nextState = handleGrab(gameState,verb);
            const grabbedEntity = extractGrabbedEntityOfClientById(nextState, verb.clientId);
            assert.equal(grabbedEntity.entityId, entityId);
            assert.equal(grabbedEntity.grabbedAtX, cursorX);
            assert.equal(grabbedEntity.grabbedAtY, cursorY);
        })
    })
})