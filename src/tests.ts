import 'mocha';
import * as assert from 'assert';
import {produce} from 'immer';

import {handleLeftMouseDown, handleLeftMouseUp, handleMouseMove} from './eventHandlers';
import {GameState, EntityTypes, CardDataModel} from '../../common/dataModelDefinitions';
import {MouseInput, MouseInputTypes} from '../../common/mouseEventTypes'
import { clientFactory, cardFactory } from './factories';
import {extractClientById, extractGrabbedEntityOfClientById, extractCardById} from './extractors';

describe('handler tests', function() {
    let initialGameState: GameState = {
        cards: [],
        clients: []
    };
    let gameState: GameState;
    let client = clientFactory();

    beforeEach('Setting up test data...', () => {
        gameState = produce(initialGameState, draft => {
            draft.cards = [cardFactory(0,0), cardFactory(0,100), cardFactory(100,0)]
            draft.clients.push(client);
        })
    })    

    describe('handleLeftMouseDown', function() {
        describe(`EntityType: ${EntityTypes.CARD}`, function(){
            it('Assignes data of clicked card to correct clients grabbedEntity.', function(){
                const entityType = EntityTypes.CARD;
                const entityId= EntityTypes.CARD + 1;
                const cursorX = 1;
                const cursorY = 2;
                const input: MouseInput = {
                    type: MouseInputTypes.LEFT_BUTTON_DOWN,
                    clientId: client.clientInfo.clientId,
                    cursorX,
                    cursorY,
                    entityId,
                    entityType
                }
                const nextState = handleLeftMouseDown(gameState,input);
                const grabbedEntity = extractGrabbedEntityOfClientById(nextState, input.clientId);
                assert.equal(grabbedEntity.entityId, entityId);
                assert.equal(grabbedEntity.grabbedAtX, cursorX);
                assert.equal(grabbedEntity.grabbedAtY, cursorY);
            })
        })
    })

    describe('handleLeftMouseUp', function() {
        describe(`EntityType: ${EntityTypes.CARD}`, function(){
            it('Sets grabbedEntity to null for correct client.', function(){
                const entityType = EntityTypes.CARD;
                const entityId= EntityTypes.CARD + 1;
                const cursorX = 1;
                const cursorY = 2;
                const input: MouseInput = {
                    type: MouseInputTypes.LEFT_BUTTON_UP,
                    clientId: client.clientInfo.clientId,
                    cursorX,
                    cursorY,
                    entityId,
                    entityType 
                }
                const nextState = handleLeftMouseUp(gameState,input);
                const grabbedEntity =extractGrabbedEntityOfClientById(nextState, input.clientId);
                assert.equal(grabbedEntity, null);
            })
        })
    })

    describe('handleMouseMove', function(){
        describe(`EntityType: ${EntityTypes.CARD}`, function() {
            it('should move the correct card by the offset of input mouse position and update grabbedEntity position for correct client', function() {
                let mouseInput: MouseInput;
                let entityType = EntityTypes.CARD;
                let nextState: GameState;
                let movedCard: CardDataModel;
                const originalCard = gameState.cards[0];
                let entityId =  originalCard.entityId;
                
                gameState = produce(gameState, draft => {
                   extractClientById(draft, client.clientInfo.clientId).grabbedEntitiy = {
                        entityId,
                        entityType,
                        grabbedAtX: 2,
                        grabbedAtY: 2
                    }
                })

                // LEFT
                mouseInput = {
                    type: MouseInputTypes.MOUSE_MOVE,
                    cursorX: 1,
                    cursorY: 2,
                    entityId,
                    entityType,
                    clientId: client.clientInfo.clientId
                }
                nextState = handleMouseMove(gameState, mouseInput);
                movedCard = extractCardById(nextState, entityId);
                assert.equal(movedCard.positionX, originalCard.positionX + mouseInput.cursorX - extractGrabbedEntityOfClientById(gameState, mouseInput.clientId).grabbedAtX);
                assert.equal(movedCard.positionY, originalCard.positionY + mouseInput.cursorY - extractGrabbedEntityOfClientById(gameState, mouseInput.clientId).grabbedAtY);

                // RIGHT
                mouseInput = {
                    type: MouseInputTypes.MOUSE_MOVE,
                    cursorX: 3,
                    cursorY: 2,
                    entityId,
                    entityType,
                    clientId: client.clientInfo.clientId

                }
                nextState = handleMouseMove(gameState, mouseInput);
                movedCard = nextState.cards.find(card => card.entityId === entityId);
                assert.equal(movedCard.positionX, originalCard.positionX + mouseInput.cursorX - extractGrabbedEntityOfClientById(gameState, mouseInput.clientId).grabbedAtX);
                assert.equal(movedCard.positionY, originalCard.positionY + mouseInput.cursorY - extractGrabbedEntityOfClientById(gameState, mouseInput.clientId).grabbedAtY);

                // UP
                mouseInput = {
                    type: MouseInputTypes.MOUSE_MOVE,
                    cursorX: 2,
                    cursorY: 1,
                    entityId,
                    entityType,
                    clientId: client.clientInfo.clientId

                }
                nextState = handleMouseMove(gameState, mouseInput);
                movedCard = nextState.cards.find(card => card.entityId === entityId);
                assert.equal(movedCard.positionX, originalCard.positionX + mouseInput.cursorX - extractGrabbedEntityOfClientById(gameState, mouseInput.clientId).grabbedAtX);
                assert.equal(movedCard.positionY, originalCard.positionY + mouseInput.cursorY - extractGrabbedEntityOfClientById(gameState, mouseInput.clientId).grabbedAtY);

                // DOWN
                mouseInput = {
                    type: MouseInputTypes.MOUSE_MOVE,
                    cursorX: 2,
                    cursorY: 3,
                    entityId,
                    entityType,
                    clientId: client.clientInfo.clientId

                }
                nextState = handleMouseMove(gameState, mouseInput);
                movedCard = nextState.cards.find(card => card.entityId === entityId);
                assert.equal(movedCard.positionX, originalCard.positionX + mouseInput.cursorX - extractGrabbedEntityOfClientById(gameState, mouseInput.clientId).grabbedAtX);
                assert.equal(movedCard.positionY, originalCard.positionY + mouseInput.cursorY - extractGrabbedEntityOfClientById(gameState, mouseInput.clientId).grabbedAtY);
            })
            it('should ignore input if the entityId in the input is null', function(){
                const input: MouseInput = {
                    entityId: null,
                    entityType: EntityTypes.CARD,
                    clientId: client.clientInfo.clientId,
                    type: MouseInputTypes.MOUSE_MOVE,
                    cursorX:1,
                    cursorY: 1,
                }
                const nextState = handleMouseMove(gameState, input);
                assert.deepEqual(nextState.cards, gameState.cards);
            })
        })
    })
})
