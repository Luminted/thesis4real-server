import produce, { enableMapSet } from "immer";
import * as assert from 'assert';

import { handleMove } from './handleMove';
import { SharedVerbTypes, SharedVerb } from "../../../../../../types/verbTypes";
import { EntityTypes, GameState, CardEntity, DeckEntity, CardTypes } from "../../../../../../types/dataModelDefinitions";
import { clientFactory, cardFactory, deckFactory, cardFactoryFromObject, deckFactoryFromObject } from "../../../../../../factories";
import { extractClientById, extractCardById, extractGrabbedEntityOfClientById, extractDeckById } from "../../../../../../extractors/gameStateExtractors";
import {initialGameState} from '../../../../../../mocks/initialGameState'

describe(`handle ${SharedVerbTypes.MOVE}`, function(){
    enableMapSet();

    let gameState: GameState;
    let client = clientFactory('socket-1');
    const cardToMove = cardFactory(50,51,CardTypes.FRENCH);
    const deckToMove = deckFactory(CardTypes.FRENCH, 80, 81);
    const boundCard = cardFactoryFromObject({
        positionX: 50,
        positionY: 51,
        cardType: CardTypes.FRENCH,
        isBound: true
    });
    const boundDeck = deckFactoryFromObject({
        positionX: 80,
        positionY: 81,
        cardType: CardTypes.FRENCH,
        isBound: true
    });
    const tableWidth = 2000;
    const tableHeight = 1500;
    const entityScale = 2;

    beforeEach('Setting up test data...', () => {
        gameState = produce(initialGameState, draft => {
            draft.cards.set(cardToMove.entityId, cardToMove);
            draft.cards.set(boundCard.entityId, boundCard);
            draft.decks.set(deckToMove.entityId, deckToMove);
            draft.decks.set(boundDeck.entityId, boundDeck);
            draft.clients.set(client.clientInfo.clientId, client);
            draft.entityScale = entityScale;
        })
    })

    const testedVerbType = SharedVerbTypes.MOVE;
    describe(`EntityType: ${EntityTypes.CARD}`, function() {
        it('should move the correct card by the offset of input mouse position and update grabbedEntity position for correct client', function() {
            let verb: SharedVerb;
            let entityType = EntityTypes.CARD;
            let nextState: GameState;
            let movedCard: CardEntity;
            let entityId =  cardToMove.entityId;
            
            gameState = produce(gameState, draft => {
            extractClientById(draft, client.clientInfo.clientId).grabbedEntitiy = {
                    entityId,
                    entityType,
                    grabbedAtX: 2,
                    grabbedAtY: 3
                }
            })

            // LEFT
            verb = {
                type: testedVerbType,
                positionX: 1,
                positionY: 2,
                entityId,
                entityType,
                clientId: client.clientInfo.clientId
            }
            nextState = handleMove(gameState, verb, tableWidth, tableHeight);
            movedCard = extractCardById(nextState, entityId);
            assert.equal(movedCard.positionX, cardToMove.positionX + verb.positionX - extractGrabbedEntityOfClientById(gameState, verb.clientId).grabbedAtX);
            assert.equal(movedCard.positionY, cardToMove.positionY + verb.positionY - extractGrabbedEntityOfClientById(gameState, verb.clientId).grabbedAtY);

            // RIGHT
            verb = {
                type: testedVerbType,
                positionX: 3,
                positionY: 2,
                entityId,
                entityType,
                clientId: client.clientInfo.clientId

            }
            nextState = handleMove(gameState, verb, tableWidth, tableHeight);
            movedCard = extractCardById(nextState, cardToMove.entityId);
            assert.equal(movedCard.positionX, cardToMove.positionX + verb.positionX - extractGrabbedEntityOfClientById(gameState, verb.clientId).grabbedAtX);
            assert.equal(movedCard.positionY, cardToMove.positionY + verb.positionY - extractGrabbedEntityOfClientById(gameState, verb.clientId).grabbedAtY);

            // UP
            verb = {
                type: testedVerbType,
                positionX: 2,
                positionY: 1,
                entityId,
                entityType,
                clientId: client.clientInfo.clientId

            }
            nextState = handleMove(gameState, verb, tableWidth, tableHeight);
            movedCard = extractCardById(nextState, cardToMove.entityId);
            assert.equal(movedCard.positionX, cardToMove.positionX + verb.positionX - extractGrabbedEntityOfClientById(gameState, verb.clientId).grabbedAtX);
            assert.equal(movedCard.positionY, cardToMove.positionY + verb.positionY - extractGrabbedEntityOfClientById(gameState, verb.clientId).grabbedAtY);

            // DOWN
            verb = {
                type: testedVerbType,
                positionX: 2,
                positionY: 3,
                entityId,
                entityType,
                clientId: client.clientInfo.clientId

            }
            nextState = handleMove(gameState, verb, tableWidth, tableHeight);
            movedCard = extractCardById(nextState, cardToMove.entityId);
            assert.equal(movedCard.positionX, cardToMove.positionX + verb.positionX - extractGrabbedEntityOfClientById(gameState, verb.clientId).grabbedAtX);
            assert.equal(movedCard.positionY, cardToMove.positionY + verb.positionY - extractGrabbedEntityOfClientById(gameState, verb.clientId).grabbedAtY);
        })
        it('should ignore input if the entityId in the input is null', function(){
            const verb: SharedVerb = {
                entityId: null,
                entityType: EntityTypes.CARD,
                clientId: client.clientInfo.clientId,
                type: testedVerbType,
                positionX:1,
                positionY: 2,
            }
            const nextState = handleMove(gameState, verb, tableWidth, tableHeight);
            assert.deepEqual(nextState.cards, gameState.cards);
        })
    })

    describe(`EntityType: ${EntityTypes.DECK}`, function() {
        it('should move the correct card by the offset of input mouse position and update grabbedEntity position for correct client', function() {
            let verb: SharedVerb;
            let entityType = EntityTypes.DECK;
            let nextState: GameState;
            let movedDeck: DeckEntity;
            const originalDeck = deckToMove;
            let entityId =  originalDeck.entityId;
            
            gameState = produce(gameState, draft => {
            extractClientById(draft, client.clientInfo.clientId).grabbedEntitiy = {
                    entityId,
                    entityType,
                    grabbedAtX: 2,
                    grabbedAtY: 3
                }
            })

            // LEFT
            verb = {
                type: testedVerbType,
                positionX: 1,
                positionY: 2,
                entityId,
                entityType,
                clientId: client.clientInfo.clientId
            }
            nextState = handleMove(gameState, verb, tableWidth, tableHeight);
            movedDeck = extractDeckById(nextState, entityId);
            assert.equal(movedDeck.positionX, originalDeck.positionX + verb.positionX - extractGrabbedEntityOfClientById(gameState, verb.clientId).grabbedAtX);
            assert.equal(movedDeck.positionY, originalDeck.positionY + verb.positionY - extractGrabbedEntityOfClientById(gameState, verb.clientId).grabbedAtY);

            // RIGHT
            verb = {
                type: testedVerbType,
                positionX: 3,
                positionY: 2,
                entityId,
                entityType,
                clientId: client.clientInfo.clientId

            }
            nextState = handleMove(gameState, verb, tableWidth, tableHeight);
            movedDeck = extractDeckById(nextState, originalDeck.entityId);
            assert.equal(movedDeck.positionX, originalDeck.positionX + verb.positionX - extractGrabbedEntityOfClientById(gameState, verb.clientId).grabbedAtX);
            assert.equal(movedDeck.positionY, originalDeck.positionY + verb.positionY - extractGrabbedEntityOfClientById(gameState, verb.clientId).grabbedAtY);

            // UP
            verb = {
                type: testedVerbType,
                positionX: 2,
                positionY: 1,
                entityId,
                entityType,
                clientId: client.clientInfo.clientId

            }
            nextState = handleMove(gameState, verb, tableWidth, tableHeight);
            movedDeck = extractDeckById(nextState, originalDeck.entityId);
            assert.equal(movedDeck.positionX, originalDeck.positionX + verb.positionX - extractGrabbedEntityOfClientById(gameState, verb.clientId).grabbedAtX);
            assert.equal(movedDeck.positionY, originalDeck.positionY + verb.positionY - extractGrabbedEntityOfClientById(gameState, verb.clientId).grabbedAtY);

            // DOWN
            verb = {
                type: testedVerbType,
                positionX: 2,
                positionY: 3,
                entityId,
                entityType,
                clientId: client.clientInfo.clientId

            }
            nextState = handleMove(gameState, verb, tableWidth, tableHeight);
            movedDeck = extractDeckById(nextState, originalDeck.entityId);
            assert.equal(movedDeck.positionX, originalDeck.positionX + verb.positionX - extractGrabbedEntityOfClientById(gameState, verb.clientId).grabbedAtX);
            assert.equal(movedDeck.positionY, originalDeck.positionY + verb.positionY - extractGrabbedEntityOfClientById(gameState, verb.clientId).grabbedAtY);
        })
        it('should ignore input if the entityId in the input is null', function(){
            const verb: SharedVerb = {
                entityId: null,
                entityType: EntityTypes.CARD,
                clientId: client.clientInfo.clientId,
                type: testedVerbType,
                positionX:1,
                positionY: 1,
            }
            const nextState = handleMove(gameState, verb, tableWidth, tableHeight);
            assert.deepEqual(nextState.cards, gameState.cards);
        })
        it('should restrict card to tables dimension if isBounded is true', function(){
            const {entityId, entityType} = boundCard;
            const {entityScale} = gameState
            const cardWidth = boundCard.width *entityScale;
            const cardHeight = boundCard.height *entityScale;
            let verb: SharedVerb;
            let nextState: GameState;
            let movedCard: CardEntity;

            gameState = produce(gameState, draft => {
                extractClientById(draft, client.clientInfo.clientId).grabbedEntitiy = {
                    entityId,
                    entityType,
                    grabbedAtX: 1,
                    grabbedAtY: 2
                }
            })

            verb = {
                entityId: entityId,
                entityType: EntityTypes.CARD,
                clientId: client.clientInfo.clientId,
                type: testedVerbType,
                positionX: -tableWidth,
                positionY: 0,
            }

            nextState = handleMove(gameState, verb, tableWidth, tableHeight);
            movedCard = extractCardById(nextState, entityId);
            assert.equal(movedCard.positionX === 0, true);

            verb = {
                entityId: entityId,
                entityType: EntityTypes.CARD,
                clientId: client.clientInfo.clientId,
                type: testedVerbType,
                positionX: 2 * tableWidth,
                positionY: 0,
            }

            nextState = handleMove(gameState, verb, tableWidth, tableHeight);
            movedCard = extractCardById(nextState, entityId);
            assert.equal(movedCard.positionX === tableWidth - cardWidth, true);

            verb = {
                entityId: entityId,
                entityType: EntityTypes.CARD,
                clientId: client.clientInfo.clientId,
                type: testedVerbType,
                positionX: 0,
                positionY: -tableHeight,
            }

            nextState = handleMove(gameState, verb, tableWidth, tableHeight);
            movedCard = extractCardById(nextState, entityId);
            assert.equal(movedCard.positionY === 0, true);

            verb = {
                entityId: entityId,
                entityType: EntityTypes.CARD,
                clientId: client.clientInfo.clientId,
                type: testedVerbType,
                positionX: 0,
                positionY: 2 * tableHeight,
            }

            nextState = handleMove(gameState, verb, tableWidth, tableHeight);
            movedCard = extractCardById(nextState, entityId);
            assert.equal(movedCard.positionY === tableHeight - cardHeight, true);
        });

        it('should restrict deck to tables dimensions if isBound is true', function(){
            const {entityId, entityType} = boundDeck;
            const {entityScale} = gameState;
            const deckWidth = boundDeck.width * entityScale;
            const deckHeight = boundDeck.height * entityScale;
            let verb: SharedVerb;
            let nextState: GameState;
            let movedDeck: DeckEntity;

            gameState = produce(gameState, draft => {
                extractClientById(draft, client.clientInfo.clientId).grabbedEntitiy = {
                    entityId,
                    entityType,
                    grabbedAtX: 1,
                    grabbedAtY: 2
                }
            })

            verb = {
                entityId: entityId,
                entityType: EntityTypes.CARD,
                clientId: client.clientInfo.clientId,
                type: testedVerbType,
                positionX: -tableWidth,
                positionY: 0,
            }
            debugger
            nextState = handleMove(gameState, verb, tableWidth, tableHeight);
            movedDeck = extractDeckById(nextState, entityId);
            assert.equal(movedDeck.positionX === 0, true);

            verb = {
                entityId: entityId,
                entityType: EntityTypes.CARD,
                clientId: client.clientInfo.clientId,
                type: testedVerbType,
                positionX: 2 * tableWidth,
                positionY: 0,
            }

            nextState = handleMove(gameState, verb, tableWidth, tableHeight);
            movedDeck = extractDeckById(nextState, entityId);
            assert.equal(movedDeck.positionX === tableWidth - deckWidth, true);

            verb = {
                entityId: entityId,
                entityType: EntityTypes.CARD,
                clientId: client.clientInfo.clientId,
                type: testedVerbType,
                positionX: 0,
                positionY: -tableHeight,
            }

            nextState = handleMove(gameState, verb, tableWidth, tableHeight);
            movedDeck = extractDeckById(nextState, entityId);
            assert.equal(movedDeck.positionY === 0, true);

            verb = {
                entityId: entityId,
                entityType: EntityTypes.CARD,
                clientId: client.clientInfo.clientId,
                type: testedVerbType,
                positionX: 0,
                positionY: 2 * tableHeight,
            }

            nextState = handleMove(gameState, verb, tableWidth, tableHeight);
            movedDeck = extractDeckById(nextState, entityId);
            assert.equal(movedDeck.positionY === tableHeight - deckHeight, true);
        })
    })
    //TODO: test for quick movement outside boundary. code already handles this
})