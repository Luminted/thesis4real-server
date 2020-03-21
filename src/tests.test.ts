import 'mocha'
import * as assert from 'assert';
import {produce} from 'immer';

import {handleGrab, handleMove, handleRelease, handleVerb, handleSharedVerbs} from './eventHandlers';
import {GameState, EntityTypes, CardEntity, DeckEntity} from '../../common/dataModelDefinitions';
import {CardVerb, DeckVerb, SharedVerb, SharedVerbTypes, DeckVerbTypes} from '../../common/verbTypes';
import { clientFactory, cardFactory, deckFactory } from './factories';
import {extractClientById, extractGrabbedEntityOfClientById, extractCardById, extractDeckById} from './extractors';

describe('handler tests', function() {
    let initialGameState: GameState = {
        cards: [],
        decks: [],
        clients: []
    };
    let gameState: GameState;
    let client = clientFactory();

    beforeEach('Setting up test data...', () => {
        gameState = produce(initialGameState, draft => {
            draft.cards = [cardFactory(0,0), cardFactory(0,100), cardFactory(100,0)]
            draft.decks = [deckFactory(10,10,10,10)]
            draft.clients.push(client);
        })
    })

    describe('Shared verb handlers', function(){
        describe(`handle ${SharedVerbTypes.GRAB} verb`, function() {
            const testedVerbType = SharedVerbTypes.GRAB;
            describe(`EntityType: ${EntityTypes.CARD}`, function(){
                it('Assignes data of clicked card to correct clients grabbedEntity.', function(){
                    const entityType = EntityTypes.CARD;
                    const entityId= EntityTypes.CARD + 1;
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

        describe(`handle ${SharedVerbTypes.RELEASE} verb`, function() {
            const testedVerbType = SharedVerbTypes.RELEASE; 
            describe(`EntityType: ${EntityTypes.CARD}`, function(){
                it('Sets grabbedEntity to null for correct client.', function(){
                    const entityType = EntityTypes.CARD;
                    const entityId= EntityTypes.CARD + 1;
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
                    const nextState = handleRelease(gameState,verb);
                    const grabbedEntity =extractGrabbedEntityOfClientById(nextState, verb.clientId);
                    assert.equal(grabbedEntity, null);
                })
            })
        })

        describe(`handle ${SharedVerbTypes.MOVE}`, function(){
            const testedVerbType = SharedVerbTypes.MOVE;
            describe(`EntityType: ${EntityTypes.CARD}`, function() {
                it('should move the correct card by the offset of input mouse position and update grabbedEntity position for correct client', function() {
                    let verb: SharedVerb;
                    let entityType = EntityTypes.CARD;
                    let nextState: GameState;
                    let movedCard: CardEntity;
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
                    verb = {
                        type: testedVerbType,
                        cursorX: 1,
                        cursorY: 2,
                        entityId,
                        entityType,
                        clientId: client.clientInfo.clientId
                    }
                    nextState = handleMove(gameState, verb);
                    movedCard = extractCardById(nextState, entityId);
                    assert.equal(movedCard.positionX, originalCard.positionX + verb.cursorX - extractGrabbedEntityOfClientById(gameState, verb.clientId).grabbedAtX);
                    assert.equal(movedCard.positionY, originalCard.positionY + verb.cursorY - extractGrabbedEntityOfClientById(gameState, verb.clientId).grabbedAtY);

                    // RIGHT
                    verb = {
                        type: testedVerbType,
                        cursorX: 3,
                        cursorY: 2,
                        entityId,
                        entityType,
                        clientId: client.clientInfo.clientId

                    }
                    nextState = handleMove(gameState, verb);
                    movedCard = nextState.cards.find(card => card.entityId === entityId);
                    assert.equal(movedCard.positionX, originalCard.positionX + verb.cursorX - extractGrabbedEntityOfClientById(gameState, verb.clientId).grabbedAtX);
                    assert.equal(movedCard.positionY, originalCard.positionY + verb.cursorY - extractGrabbedEntityOfClientById(gameState, verb.clientId).grabbedAtY);

                    // UP
                    verb = {
                        type: testedVerbType,
                        cursorX: 2,
                        cursorY: 1,
                        entityId,
                        entityType,
                        clientId: client.clientInfo.clientId

                    }
                    nextState = handleMove(gameState, verb);
                    movedCard = nextState.cards.find(card => card.entityId === entityId);
                    assert.equal(movedCard.positionX, originalCard.positionX + verb.cursorX - extractGrabbedEntityOfClientById(gameState, verb.clientId).grabbedAtX);
                    assert.equal(movedCard.positionY, originalCard.positionY + verb.cursorY - extractGrabbedEntityOfClientById(gameState, verb.clientId).grabbedAtY);

                    // DOWN
                    verb = {
                        type: testedVerbType,
                        cursorX: 2,
                        cursorY: 3,
                        entityId,
                        entityType,
                        clientId: client.clientInfo.clientId

                    }
                    nextState = handleMove(gameState, verb);
                    movedCard = nextState.cards.find(card => card.entityId === entityId);
                    assert.equal(movedCard.positionX, originalCard.positionX + verb.cursorX - extractGrabbedEntityOfClientById(gameState, verb.clientId).grabbedAtX);
                    assert.equal(movedCard.positionY, originalCard.positionY + verb.cursorY - extractGrabbedEntityOfClientById(gameState, verb.clientId).grabbedAtY);
                })
                it('should ignore input if the entityId in the input is null', function(){
                    const verb: SharedVerb = {
                        entityId: null,
                        entityType: EntityTypes.CARD,
                        clientId: client.clientInfo.clientId,
                        type: testedVerbType,
                        cursorX:1,
                        cursorY: 1,
                    }
                    const nextState = handleMove(gameState, verb);
                    assert.deepEqual(nextState.cards, gameState.cards);
                })
            })

            describe(`EntityType: ${EntityTypes.DECK}`, function() {
                it('should move the correct card by the offset of input mouse position and update grabbedEntity position for correct client', function() {
                    let verb: SharedVerb;
                    let entityType = EntityTypes.DECK;
                    let nextState: GameState;
                    let movedDeck: DeckEntity;
                    const originalDeck = gameState.decks[0];
                    let entityId =  originalDeck.entityId;
                    
                    gameState = produce(gameState, draft => {
                    extractClientById(draft, client.clientInfo.clientId).grabbedEntitiy = {
                            entityId,
                            entityType,
                            grabbedAtX: 2,
                            grabbedAtY: 2
                        }
                    })

                    // LEFT
                    verb = {
                        type: testedVerbType,
                        cursorX: 1,
                        cursorY: 2,
                        entityId,
                        entityType,
                        clientId: client.clientInfo.clientId
                    }
                    nextState = handleMove(gameState, verb);
                    movedDeck = extractDeckById(nextState, entityId);
                    assert.equal(movedDeck.positionX, originalDeck.positionX + verb.cursorX - extractGrabbedEntityOfClientById(gameState, verb.clientId).grabbedAtX);
                    assert.equal(movedDeck.positionY, originalDeck.positionY + verb.cursorY - extractGrabbedEntityOfClientById(gameState, verb.clientId).grabbedAtY);

                    // RIGHT
                    verb = {
                        type: testedVerbType,
                        cursorX: 3,
                        cursorY: 2,
                        entityId,
                        entityType,
                        clientId: client.clientInfo.clientId

                    }
                    nextState = handleMove(gameState, verb);
                    movedDeck = nextState.decks.find(card => card.entityId === entityId);
                    assert.equal(movedDeck.positionX, originalDeck.positionX + verb.cursorX - extractGrabbedEntityOfClientById(gameState, verb.clientId).grabbedAtX);
                    assert.equal(movedDeck.positionY, originalDeck.positionY + verb.cursorY - extractGrabbedEntityOfClientById(gameState, verb.clientId).grabbedAtY);

                    // UP
                    verb = {
                        type: testedVerbType,
                        cursorX: 2,
                        cursorY: 1,
                        entityId,
                        entityType,
                        clientId: client.clientInfo.clientId

                    }
                    nextState = handleMove(gameState, verb);
                    movedDeck = nextState.decks.find(card => card.entityId === entityId);
                    assert.equal(movedDeck.positionX, originalDeck.positionX + verb.cursorX - extractGrabbedEntityOfClientById(gameState, verb.clientId).grabbedAtX);
                    assert.equal(movedDeck.positionY, originalDeck.positionY + verb.cursorY - extractGrabbedEntityOfClientById(gameState, verb.clientId).grabbedAtY);

                    // DOWN
                    verb = {
                        type: testedVerbType,
                        cursorX: 2,
                        cursorY: 3,
                        entityId,
                        entityType,
                        clientId: client.clientInfo.clientId

                    }
                    nextState = handleMove(gameState, verb);
                    movedDeck = nextState.decks.find(card => card.entityId === entityId);
                    assert.equal(movedDeck.positionX, originalDeck.positionX + verb.cursorX - extractGrabbedEntityOfClientById(gameState, verb.clientId).grabbedAtX);
                    assert.equal(movedDeck.positionY, originalDeck.positionY + verb.cursorY - extractGrabbedEntityOfClientById(gameState, verb.clientId).grabbedAtY);
                })
                it('should ignore input if the entityId in the input is null', function(){
                    const verb: SharedVerb = {
                        entityId: null,
                        entityType: EntityTypes.CARD,
                        clientId: client.clientInfo.clientId,
                        type: testedVerbType,
                        cursorX:1,
                        cursorY: 1,
                    }
                    const nextState = handleMove(gameState, verb);
                    assert.deepEqual(nextState.cards, gameState.cards);
                })
            })
        })
    })
})
