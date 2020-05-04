import * as assert from 'assert'

import { handleGrab } from "./handleGrabFromTable";
import { SharedVerbTypes, SharedVerb } from "../../../../types/verbTypes";
import { EntityTypes, GameState, Client, CardTypes } from "../../../../types/dataModelDefinitions";
import { extractGrabbedEntityOfClientById } from "../../../../extractors/gameStateExtractors";
import { clientFactory, cardFactory, deckFactory } from '../../../../factories';
import produce from 'immer';
import {initialGameState} from '../../../../__mocks__/initialGameState'




describe(`handle ${SharedVerbTypes.GRAB_FROM_TABLE} verb`, function() {
    let gameState: GameState;
    let client: Client;

    beforeEach('Setting up test data...', () => {
        client = clientFactory('socket-1');
        gameState = produce(initialGameState, draft => {
            draft.cards = [cardFactory(0,0, CardTypes.FRENCH)]
            draft.decks = [deckFactory(CardTypes.FRENCH, 100,100)]
            draft.clients = [client]
        })
    })

    const testedVerbType = SharedVerbTypes.GRAB_FROM_TABLE;
    describe(`EntityType: ${EntityTypes.CARD}`, function(){
        it('Assignes data of clicked card to correct clients grabbedEntity.', function(){
            const {entityId, entityType} = gameState.cards[0];
            const positionX = 1;
            const positionY = 2;
            const verb: SharedVerb = {
                type: testedVerbType,
                clientId: client.clientInfo.clientId,
                positionX: positionX,
                positionY,
                entityId,
                entityType
            }
            const nextState = handleGrab(gameState,verb);
            const grabbedEntity = extractGrabbedEntityOfClientById(nextState, verb.clientId);
            assert.equal(grabbedEntity.entityId, entityId);
            assert.equal(grabbedEntity.grabbedAtX, positionX);
            assert.equal(grabbedEntity.grabbedAtY, positionY);
        })
    })

    describe(`EntityType: ${EntityTypes.DECK}`, function(){
        it('Assignes data of clicked card to correct clients grabbedEntity.', function(){
            const {entityType, entityId } = gameState.decks[0]
            const positionX = 1;
            const positionY = 2;
            const verb: SharedVerb = {
                type: testedVerbType,
                clientId: client.clientInfo.clientId,
                positionX: positionX,
                positionY,
                entityId,
                entityType
            }
            const nextState = handleGrab(gameState,verb);
            const grabbedEntity = extractGrabbedEntityOfClientById(nextState, verb.clientId);
            assert.equal(grabbedEntity.entityId, entityId);
            assert.equal(grabbedEntity.grabbedAtX, positionX);
            assert.equal(grabbedEntity.grabbedAtY, positionY);
        })
    })
})