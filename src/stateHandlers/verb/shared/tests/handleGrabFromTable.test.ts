import assert from 'assert'
import cloneDeep from "lodash.clonedeep";
import { IGrabVerb, ESharedVerbTypes } from "../../../../typings";
import { extractGrabbedEntityOfClientById, extractEntityByTypeAndId, extractCardById } from "../../../../extractors";
import { SharedVerbHandler } from '../SharedVerbHandler';
import { Container } from 'typescript-ioc';
import { cardEntityMock1, cardEntityMock2, mockClient1 } from '../../../../mocks';
import { GameStateStore } from '../../../../stores';

describe(`handle ${ESharedVerbTypes.GRAB} verb`, () => {
    const sharedVerbHandler = new SharedVerbHandler();
    const gameStateStore = Container.get(GameStateStore)
    const {clientInfo: {clientId}} = mockClient1;
    const cardOnTable = {...cardEntityMock1};
    const grabbedCard = {...cardEntityMock2};
    const verb: IGrabVerb = {
        clientId,
        type: ESharedVerbTypes.GRAB,
        positionX: 0,
        positionY: 1,
        entityId: cardOnTable.entityId,
        entityType: cardOnTable.entityType
    }
    grabbedCard.grabbedBy = clientId;

    beforeEach('Setting up test data...', () => {
        gameStateStore.resetState();
        gameStateStore.changeState(draft => {
            draft.cards.set(cardOnTable.entityId, cardOnTable);
            draft.cards.set(grabbedCard.entityId, grabbedCard);
            draft.clients.set(clientId, {...mockClient1});
        });
    })

    it('Assignes data of clicked card to correct clients grabbedEntity.', () =>{
        const {entityId} = cardOnTable;
        const {positionX, positionY} = verb;

        const nextGameState = sharedVerbHandler.grabFromTable(verb);

        const grabbedEntity = extractGrabbedEntityOfClientById(nextGameState, verb.clientId);
        assert.equal(grabbedEntity.entityId, entityId);
        assert.equal(grabbedEntity.grabbedAtX, positionX);
        assert.equal(grabbedEntity.grabbedAtY, positionY);
    });

    it('should set grabbedBy to clients ID', () =>{
        const {entityId, entityType} = cardOnTable;
        
        const nextGameState = sharedVerbHandler.grabFromTable(verb);

        const nextCard = extractEntityByTypeAndId(nextGameState ,entityType, entityId);
        assert.equal(nextCard.grabbedBy, clientId);
    })
    it('should do nothing if card is already grabbed', () =>{
        const originalState = cloneDeep(gameStateStore.state);
        const {entityId, entityType} = grabbedCard;
        const positionX = 1;
        const positionY = 2;
        const verb: IGrabVerb = {
            type: ESharedVerbTypes.GRAB,
            clientId: clientId,
            positionX: positionX,
            positionY,
            entityId,
            entityType
        }

        const nextGameState = sharedVerbHandler.grabFromTable(verb);

        assert.deepEqual(nextGameState, originalState);
    })
    it('should set highest zIndex and also bump top zIndex', () =>{
        const originalTopZIndex = gameStateStore.state.topZIndex;

        sharedVerbHandler.grabFromTable(verb);

        const grabbedCard = extractCardById(gameStateStore.state ,cardOnTable.entityId);
        const bumpedZindex = gameStateStore.state.topZIndex;
        assert.equal(grabbedCard.zIndex, originalTopZIndex + 1);
        assert.equal(bumpedZindex, originalTopZIndex + 1);
    })
})