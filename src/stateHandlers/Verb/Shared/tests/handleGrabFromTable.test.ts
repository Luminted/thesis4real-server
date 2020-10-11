import assert from 'assert'
import {spy} from 'sinon';
import { IGrabVerb, SharedVerbTypes } from "../../../../types/verb";
import { extractGrabbedEntityOfClientById, extractEntityByTypeAndId, extractCardById } from "../../../../extractors/gameStateExtractors";
import * as utils from '../../../../utils';
import { mockClient1 } from '../../../../mocks/clientMocks';
import { SharedVerbHandler } from '../SharedVerbHandler';
import { Container } from 'typescript-ioc';
import { TableStateStore } from '../../../../stores/TableStateStore/TableStateStore';
import { cardEntityMock1, cardEntityMock2 } from '../../../../mocks/entityMocks';

describe(`handle ${SharedVerbTypes.GRAB} verb`, function() {
    const sharedVerbHandler = new SharedVerbHandler();
    const gameStateStore = Container.get(TableStateStore).state.gameStateStore;
    const {clientInfo: {clientId}} = mockClient1;
    const freeCard = {...cardEntityMock1};
    const grabbedCard = {...cardEntityMock2};
    const verb: IGrabVerb = {
        clientId,
        type: SharedVerbTypes.GRAB,
        positionX: 0,
        positionY: 1,
        entityId: freeCard.entityId,
        entityType: freeCard.entityType
    }
    grabbedCard.grabbedBy = clientId;

    beforeEach('Setting up test data...', () => {
        gameStateStore.resetState();
        gameStateStore.changeState(draft => {
            draft.cards.set(freeCard.entityId, freeCard);
            draft.cards.set(grabbedCard.entityId, grabbedCard);
            draft.clients.set(clientId, {...mockClient1});
        });
    })

    it('Assignes data of clicked card to correct clients grabbedEntity.', function(){
        const {entityId} = freeCard;
        const {positionX, positionY} = verb;

        const nextGameState = sharedVerbHandler.grabFromTable(verb);

        const grabbedEntity = extractGrabbedEntityOfClientById(nextGameState, verb.clientId);
        assert.equal(grabbedEntity.entityId, entityId);
        assert.equal(grabbedEntity.grabbedAtX, positionX);
        assert.equal(grabbedEntity.grabbedAtY, positionY);
    });

    it('should set grabbedBy to clients ID', function(){
        const {entityId, entityType} = freeCard;
        
        const nextGameState = sharedVerbHandler.grabFromTable(verb);

        const nextCard = extractEntityByTypeAndId(nextGameState ,entityType, entityId);
        assert.equal(nextCard.grabbedBy, clientId);
    })
    it('should do nothing if card is already grabbed', function(){
        const originalState = {...gameStateStore.state}
        const {entityId, entityType} = grabbedCard;
        const positionX = 1;
        const positionY = 2;
        const verb: IGrabVerb = {
            type: SharedVerbTypes.GRAB,
            clientId: clientId,
            positionX: positionX,
            positionY,
            entityId,
            entityType
        }

        const nextGameState = sharedVerbHandler.grabFromTable(verb);

        assert.deepEqual(nextGameState, originalState);
    })
    it('should set zIndex of grabbed card to result of calcNextZIndex', function(){
        const calcNextZIndexSpy = spy(utils, 'calcNextZIndex');

        const nextGameState = sharedVerbHandler.grabFromTable(verb);

        const grabbedFreeCard = extractCardById(nextGameState ,freeCard.entityId);
        assert.equal(grabbedFreeCard.zIndex, calcNextZIndexSpy.returnValues[0]);
        calcNextZIndexSpy.restore();
    })
})