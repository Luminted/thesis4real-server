import assert from 'assert'
import produce, { enableMapSet } from 'immer';
import {spy} from 'sinon';

import { handleGrab } from "./handleGrabFromTable";
import { SharedVerbTypes, SharedVerb } from "../../../../../../types/verbTypes";
import { EntityTypes, GameState, Client, CardTypes } from "../../../../../../types/dataModelDefinitions";
import { extractGrabbedEntityOfClientById, extractEntityByTypeAndId, extractClientHandCardsById, extractCardById } from "../../../../../../extractors/gameStateExtractors";
import { createClient, createCard, createDeck } from '../../../../../../factories';
import {initialGameState} from '../../../../../../mocks/initialGameState'
import * as utils from '../../../../utils';

describe(`handle ${SharedVerbTypes.GRAB_FROM_TABLE} verb`, function() {

    enableMapSet()

    let gameState: GameState;
    let client: Client = createClient('socket-1');
    const freeCard = createCard(0,0,CardTypes.FRENCH);
    const grabbedCard = createCard(0,0,CardTypes.FRENCH);
    const verb: SharedVerb = {
        type: SharedVerbTypes.GRAB_FROM_TABLE,
        clientId: client.clientInfo.clientId,
        positionX: 0,
        positionY: 1,
        entityId: freeCard.entityId,
        entityType: freeCard.entityType
    }
    grabbedCard.grabbedBy = client.clientInfo.clientId;

    beforeEach('Setting up test data...', () => {
        gameState = produce(initialGameState, draft => {
            draft.cards.set(freeCard.entityId, freeCard);
            draft.cards.set(grabbedCard.entityId, grabbedCard);
            draft.clients.set(client.clientInfo.clientId, client);
        })
    })

        it('Assignes data of clicked card to correct clients grabbedEntity.', function(){
            const {entityId} = freeCard;
            const {positionX, positionY} = verb;
            const nextState = handleGrab(gameState,verb);
            const grabbedEntity = extractGrabbedEntityOfClientById(nextState, verb.clientId);
            assert.equal(grabbedEntity.entityId, entityId);
            assert.equal(grabbedEntity.grabbedAtX, positionX);
            assert.equal(grabbedEntity.grabbedAtY, positionY);
        });

        it('should set grabbedBy to clients ID', function(){
            const {entityId, entityType} = freeCard;
            const nextState = handleGrab(gameState, verb);
            const nextCard = extractEntityByTypeAndId(nextState, entityType, entityId);
            assert.equal(nextCard.grabbedBy, client.clientInfo.clientId);
        })
        it('should do nothing if card is grabbed', function(){
            const {entityId, entityType} = grabbedCard;
            const positionX = 1;
            const positionY = 2;
            const verb: SharedVerb = {
                type: SharedVerbTypes.GRAB_FROM_TABLE,
                clientId: client.clientInfo.clientId,
                positionX: positionX,
                positionY,
                entityId,
                entityType
            }

            const nextState = handleGrab(gameState, verb);
            assert.deepEqual(nextState, gameState);
        })
        it('should set zIndex of grabbed card to result of calcNextZIndex', function(){
            const calcNextZIndexSpy = spy(utils, 'calcNextZIndex');
            const nextGameState = handleGrab(gameState, verb);
            const grabbedFreeCard = extractCardById(nextGameState, freeCard.entityId);
            assert.equal(grabbedFreeCard.zIndex, calcNextZIndexSpy.returnValues[0]);
            calcNextZIndexSpy.restore();
        })
    })