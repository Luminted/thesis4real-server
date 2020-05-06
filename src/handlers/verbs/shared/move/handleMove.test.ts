import produce from "immer";
import * as assert from 'assert';

import { handleMove } from './handleMove';
import { SharedVerbTypes, SharedVerb } from "../../../.././types/verbTypes";
import { EntityTypes, GameState, CardEntity, DeckEntity, CardTypes, Boundary } from "../../../.././types/dataModelDefinitions";
import { clientFactory, cardFactory, deckFactory } from "../../../../factories";
import { extractClientById, extractCardById, extractGrabbedEntityOfClientById, extractDeckById } from "../../../../extractors/gameStateExtractors";
import {initialGameState} from '../../../../mocks/initialGameState'

describe(`handle ${SharedVerbTypes.MOVE}`, function(){
    let gameState: GameState;
    let client = clientFactory('socket-1');
    const cardBoundary: Boundary = {
        top: 0,
        left: 1,
        bottom: 110, 
        right: 111,
    }
    const deckBoundary: Boundary = {
        top: 10,
        left: 11,
        bottom: 120, 
        right: 121,
    }
    const cardOutsideBoundary = cardFactory(1000,1000, CardTypes.FRENCH);

    beforeEach('Setting up test data...', () => {
        gameState = produce(initialGameState, draft => {
            draft.cards = [cardFactory(50,50, CardTypes.FRENCH), cardFactory(60,60, CardTypes.FRENCH), cardFactory(70,70, CardTypes.FRENCH), cardOutsideBoundary];
            draft.decks = [deckFactory(CardTypes.FRENCH, 80,80)]
            draft.clients.push(client);
        })
    })

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
                positionX: 1,
                positionY: 2,
                entityId,
                entityType,
                clientId: client.clientInfo.clientId
            }
            nextState = handleMove(gameState, verb);
            movedCard = extractCardById(nextState, entityId);
            assert.equal(movedCard.positionX, originalCard.positionX + verb.positionX - extractGrabbedEntityOfClientById(gameState, verb.clientId).grabbedAtX);
            assert.equal(movedCard.positionY, originalCard.positionY + verb.positionY - extractGrabbedEntityOfClientById(gameState, verb.clientId).grabbedAtY);

            // RIGHT
            verb = {
                type: testedVerbType,
                positionX: 3,
                positionY: 2,
                entityId,
                entityType,
                clientId: client.clientInfo.clientId

            }
            nextState = handleMove(gameState, verb);
            movedCard = nextState.cards.find(card => card.entityId === entityId);
            assert.equal(movedCard.positionX, originalCard.positionX + verb.positionX - extractGrabbedEntityOfClientById(gameState, verb.clientId).grabbedAtX);
            assert.equal(movedCard.positionY, originalCard.positionY + verb.positionY - extractGrabbedEntityOfClientById(gameState, verb.clientId).grabbedAtY);

            // UP
            verb = {
                type: testedVerbType,
                positionX: 2,
                positionY: 1,
                entityId,
                entityType,
                clientId: client.clientInfo.clientId

            }
            nextState = handleMove(gameState, verb);
            movedCard = nextState.cards.find(card => card.entityId === entityId);
            assert.equal(movedCard.positionX, originalCard.positionX + verb.positionX - extractGrabbedEntityOfClientById(gameState, verb.clientId).grabbedAtX);
            assert.equal(movedCard.positionY, originalCard.positionY + verb.positionY - extractGrabbedEntityOfClientById(gameState, verb.clientId).grabbedAtY);

            // DOWN
            verb = {
                type: testedVerbType,
                positionX: 2,
                positionY: 3,
                entityId,
                entityType,
                clientId: client.clientInfo.clientId

            }
            nextState = handleMove(gameState, verb);
            movedCard = nextState.cards.find(card => card.entityId === entityId);
            assert.equal(movedCard.positionX, originalCard.positionX + verb.positionX - extractGrabbedEntityOfClientById(gameState, verb.clientId).grabbedAtX);
            assert.equal(movedCard.positionY, originalCard.positionY + verb.positionY - extractGrabbedEntityOfClientById(gameState, verb.clientId).grabbedAtY);
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
                positionX: 1,
                positionY: 2,
                entityId,
                entityType,
                clientId: client.clientInfo.clientId
            }
            nextState = handleMove(gameState, verb);
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
            nextState = handleMove(gameState, verb);
            movedDeck = nextState.decks.find(card => card.entityId === entityId);
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
            nextState = handleMove(gameState, verb);
            movedDeck = nextState.decks.find(card => card.entityId === entityId);
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
            nextState = handleMove(gameState, verb);
            movedDeck = nextState.decks.find(card => card.entityId === entityId);
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
            const nextState = handleMove(gameState, verb);
            assert.deepEqual(nextState.cards, gameState.cards);
        })
        it('should restrict card to boundary if given', function(){
            const card = gameState.cards[0];
            const {entityId, entityType} = card;
            const cardWidth = card.width * card.scale;
            const cardHeight = card.height * card.scale;
            let verb: SharedVerb;
            let nextState: GameState;
            let movedCard: CardEntity;

            gameState = produce(gameState, draft => {
                draft.cardBoundary = cardBoundary;
                extractClientById(draft, client.clientInfo.clientId).grabbedEntitiy = {
                        entityId,
                        entityType,
                        grabbedAtX: 2,
                        grabbedAtY: 2
                    }
                })

            verb = {
                entityId: entityId,
                entityType: EntityTypes.CARD,
                clientId: client.clientInfo.clientId,
                type: testedVerbType,
                positionX: -1000,
                positionY: 0,
            }

            nextState = handleMove(gameState, verb);
            movedCard = extractCardById(nextState, entityId);
            assert.equal(movedCard.positionX === cardBoundary.left, true);

            verb = {
                entityId: entityId,
                entityType: EntityTypes.CARD,
                clientId: client.clientInfo.clientId,
                type: testedVerbType,
                positionX: 1000,
                positionY: 0,
            }

            nextState = handleMove(gameState, verb);
            movedCard = extractCardById(nextState, entityId);
            assert.equal(movedCard.positionX === cardBoundary.right - cardWidth, true);

            verb = {
                entityId: entityId,
                entityType: EntityTypes.CARD,
                clientId: client.clientInfo.clientId,
                type: testedVerbType,
                positionX: 0,
                positionY: -1000,
            }

            nextState = handleMove(gameState, verb);
            movedCard = extractCardById(nextState, entityId);
            assert.equal(movedCard.positionY === cardBoundary.top, true);

            verb = {
                entityId: entityId,
                entityType: EntityTypes.CARD,
                clientId: client.clientInfo.clientId,
                type: testedVerbType,
                positionX: 0,
                positionY: 1000,
            }

            nextState = handleMove(gameState, verb);
            movedCard = extractCardById(nextState, entityId);
            assert.equal(movedCard.positionY === cardBoundary.bottom - cardHeight, true);
        });

        it('should restrict deck to boundary if given', function(){
            const deck = gameState.decks[0];
            const {entityId, entityType} = deck;
            const deckWidth = deck.width * deck.scale;
            const deckHeight = deck.height * deck.scale;
            let verb: SharedVerb;
            let nextState: GameState;
            let movedDeck: DeckEntity;

            gameState = produce(gameState, draft => {
                draft.deckBoundary = deckBoundary;
                extractClientById(draft, client.clientInfo.clientId).grabbedEntitiy = {
                    entityId,
                    entityType,
                    grabbedAtX: 2,
                    grabbedAtY: 2
                }
            })

            verb = {
                entityId: entityId,
                entityType: EntityTypes.CARD,
                clientId: client.clientInfo.clientId,
                type: testedVerbType,
                positionX: -1000,
                positionY: 0,
            }

            nextState = handleMove(gameState, verb);
            movedDeck = extractDeckById(nextState, entityId);
            assert.equal(movedDeck.positionX === deckBoundary.left, true);

            verb = {
                entityId: entityId,
                entityType: EntityTypes.CARD,
                clientId: client.clientInfo.clientId,
                type: testedVerbType,
                positionX: 1000,
                positionY: 0,
            }

            nextState = handleMove(gameState, verb);
            movedDeck = extractDeckById(nextState, entityId);
            assert.equal(movedDeck.positionX === deckBoundary.right - deckWidth, true);

            verb = {
                entityId: entityId,
                entityType: EntityTypes.CARD,
                clientId: client.clientInfo.clientId,
                type: testedVerbType,
                positionX: 0,
                positionY: -1000,
            }

            nextState = handleMove(gameState, verb);
            movedDeck = extractDeckById(nextState, entityId);
            assert.equal(movedDeck.positionY === deckBoundary.top, true);

            verb = {
                entityId: entityId,
                entityType: EntityTypes.CARD,
                clientId: client.clientInfo.clientId,
                type: testedVerbType,
                positionX: 0,
                positionY: 1000,
            }

            nextState = handleMove(gameState, verb);
            movedDeck = extractDeckById(nextState, entityId);
            assert.equal(movedDeck.positionY === deckBoundary.bottom - deckHeight, true);
        })
    })
})