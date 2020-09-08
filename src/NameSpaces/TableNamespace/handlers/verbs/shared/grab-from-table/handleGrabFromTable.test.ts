import * as assert from 'assert'
import {spy} from 'sinon';

import { handleGrab } from "./handleGrabFromTable";
import { SharedVerbTypes, SharedVerb } from "../../../../../../types/verbTypes";
import { Client, CardTypes } from "../../../../../../types/dataModelDefinitions";
import { extractGrabbedEntityOfClientById, extractEntityByTypeAndId, extractCardById } from "../../../../../../extractors/gameStateExtractors";
import { cardFactory } from '../../../../../../factories';
import { GameStateStore } from '../../../../../../Store/GameStateStore';
import * as utils from '../../../../utils';
import { client1 } from '../../../../../../mocks/client';

describe(`handle ${SharedVerbTypes.GRAB_FROM_TABLE} verb`, function() {
    const client: Client = client1;
    const gameStateStore = new GameStateStore();
    const freeCard = cardFactory(0,0,CardTypes.FRENCH);
    const grabbedCard = cardFactory(0,0,CardTypes.FRENCH);
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
        gameStateStore.resetState();
        gameStateStore.changeState(draft => {
            draft.cards.set(freeCard.entityId, freeCard);
            draft.cards.set(grabbedCard.entityId, grabbedCard);
            draft.clients.set(client.clientInfo.clientId, client);
        });
    })

    it('Assignes data of clicked card to correct clients grabbedEntity.', function(){
        const {entityId} = freeCard;
        const {positionX, positionY} = verb;

        gameStateStore.changeState(draft => {
            handleGrab(draft, verb);
        })

        const grabbedEntity = extractGrabbedEntityOfClientById(gameStateStore.state, verb.clientId);
        assert.equal(grabbedEntity.entityId, entityId);
        assert.equal(grabbedEntity.grabbedAtX, positionX);
        assert.equal(grabbedEntity.grabbedAtY, positionY);
    });

    it('should set grabbedBy to clients ID', function(){
        const {entityId, entityType} = freeCard;
        gameStateStore.changeState(draft => handleGrab(draft, verb));
        const nextCard = extractEntityByTypeAndId(gameStateStore.state ,entityType, entityId);
        assert.equal(nextCard.grabbedBy, client.clientInfo.clientId);
    })
    it('should do nothing if card is already grabbed', function(){
        const originalState = {
            ...gameStateStore.state
        }
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

        gameStateStore.changeState(draft => handleGrab(draft, verb));
        assert.deepEqual(gameStateStore.state, originalState);
    })
    it('should set zIndex of grabbed card to result of calcNextZIndex', function(){
        const calcNextZIndexSpy = spy(utils, 'calcNextZIndex');

        gameStateStore.changeState(draft => handleGrab(draft, verb));

        const grabbedFreeCard = extractCardById(gameStateStore.state ,freeCard.entityId);
        assert.equal(grabbedFreeCard.zIndex, calcNextZIndexSpy.returnValues[0]);
        calcNextZIndexSpy.restore();
    })
})