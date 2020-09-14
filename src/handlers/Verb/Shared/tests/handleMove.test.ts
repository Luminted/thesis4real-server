import * as assert from 'assert';
import { SharedVerbTypes, SharedVerb } from "../../../../types/verbTypes";
import { EntityTypes, CardEntity, DeckEntity, CardTypes, GameState } from "../../../../types/dataModelDefinitions";
import { cardFactory, deckFactory, cardFactoryFromObject, deckFactoryFromObject } from "../../../../factories";
import { extractClientById, extractCardById, extractDeckById } from "../../../../extractors/gameStateExtractors";
import { client1 } from "../../../../mocks/client";
import { SharedVerbHandler } from '../SharedVerbHandler';
import { Container } from 'typescript-ioc';
import { TableStateStore } from '../../../../stores/TableStateStore/TableStateStore';

describe(`handle ${SharedVerbTypes.MOVE}`, function(){
    const sharedVerbHandler = new SharedVerbHandler();
    const tableStateStore = Container.get(TableStateStore); 
    const gameStateStore = tableStateStore.state.gameStateStore;
    const client = client1;
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
    const {tableHeight, tableWidth} = tableStateStore.state;
    const entityScale = 2;

    beforeEach('Setting up test data...', () => {
        gameStateStore.resetState();
        gameStateStore.changeState(draft => {
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
            const grabbedAt = {
                x: 2,
                y: 3
            }
            let verb: SharedVerb;
            let entityType = EntityTypes.CARD;
            let movedCard: CardEntity;
            let entityId =  cardToMove.entityId;
            let nextGameState: GameState;
            
            gameStateStore.changeState(draft => {
                extractClientById(draft, client.clientInfo.clientId).grabbedEntitiy = {
                    entityId,
                    entityType,
                    grabbedAtX: grabbedAt.x,
                    grabbedAtY: grabbedAt.y
                }
            })

            // LEFT
            verb = {
                type: testedVerbType,
                positionX: 1,
                positionY: 3,
                entityId,
                entityType,
                clientId: client.clientInfo.clientId
            }
           
            nextGameState = sharedVerbHandler.move(verb);

            movedCard = extractCardById(nextGameState, entityId);
            assert.equal(movedCard.positionX, cardToMove.positionX + verb.positionX - grabbedAt.x);
            assert.equal(movedCard.positionY, cardToMove.positionY + verb.positionY - grabbedAt.y);

            // RIGHT
            verb = {
                type: testedVerbType,
                positionX: 3,
                positionY: 3,
                entityId,
                entityType,
                clientId: client.clientInfo.clientId

            }
           
            nextGameState = sharedVerbHandler.move(verb);

            movedCard = extractCardById(nextGameState, cardToMove.entityId);
            assert.equal(movedCard.positionX, cardToMove.positionX + verb.positionX - grabbedAt.x);
            assert.equal(movedCard.positionY, cardToMove.positionY + verb.positionY - grabbedAt.y);

            // UP
            verb = {
                type: testedVerbType,
                positionX: 2,
                positionY: 1,
                entityId,
                entityType,
                clientId: client.clientInfo.clientId

            }
          
            nextGameState = sharedVerbHandler.move(verb);

            movedCard = extractCardById(nextGameState, cardToMove.entityId);
            assert.equal(movedCard.positionX, cardToMove.positionX + verb.positionX - grabbedAt.x);
            assert.equal(movedCard.positionY, cardToMove.positionY + verb.positionY - grabbedAt.y);

            // DOWN
            verb = {
                type: testedVerbType,
                positionX: 2,
                positionY: 3,
                entityId,
                entityType,
                clientId: client.clientInfo.clientId

            }
           
            nextGameState = sharedVerbHandler.move(verb);

            movedCard = extractCardById(nextGameState, cardToMove.entityId);
            assert.equal(movedCard.positionX, cardToMove.positionX + verb.positionX - grabbedAt.x);
            assert.equal(movedCard.positionY, cardToMove.positionY + verb.positionY - grabbedAt.y);
        })
        it('should ignore input if the entityId in the input is null', function(){
            const originalState = {...gameStateStore.state};
            const verb: SharedVerb = {
                entityId: null,
                entityType: EntityTypes.CARD,
                clientId: client.clientInfo.clientId,
                type: testedVerbType,
                positionX:1,
                positionY: 2,
            }
           
            const nextGameState = sharedVerbHandler.move(verb);

            assert.deepEqual(nextGameState.cards, originalState.cards);
        })
    })

    describe(`EntityType: ${EntityTypes.DECK}`, function() {
        it('should move the correct card by the offset of input mouse position and update grabbedEntity position for correct client', function() {
            const grabbedAt = {
                x: 2,
                y: 3
            }
            const originalDeck = deckToMove;
            let verb: SharedVerb;
            let entityType = EntityTypes.DECK;
            let movedDeck: DeckEntity;
            let entityId =  originalDeck.entityId;
            let nextGameState: GameState;
            
            gameStateStore.changeState(draft => {
            extractClientById(draft, client.clientInfo.clientId).grabbedEntitiy = {
                    entityId,
                    entityType,
                    grabbedAtX: grabbedAt.x,
                    grabbedAtY: grabbedAt.y
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
           
            nextGameState = sharedVerbHandler.move(verb);

            movedDeck = extractDeckById(nextGameState, entityId);
            assert.equal(movedDeck.positionX, originalDeck.positionX + verb.positionX - grabbedAt.x);
            assert.equal(movedDeck.positionY, originalDeck.positionY + verb.positionY - grabbedAt.y);

            // RIGHT
            verb = {
                type: testedVerbType,
                positionX: 3,
                positionY: 2,
                entityId,
                entityType,
                clientId: client.clientInfo.clientId

            }
           
            nextGameState = sharedVerbHandler.move(verb);

            movedDeck = extractDeckById(nextGameState, originalDeck.entityId);
            assert.equal(movedDeck.positionX, originalDeck.positionX + verb.positionX - grabbedAt.x);
            assert.equal(movedDeck.positionY, originalDeck.positionY + verb.positionY - grabbedAt.y);

            // UP
            verb = {
                type: testedVerbType,
                positionX: 2,
                positionY: 1,
                entityId,
                entityType,
                clientId: client.clientInfo.clientId

            }
           
            nextGameState = sharedVerbHandler.move(verb);

            movedDeck = extractDeckById(nextGameState, originalDeck.entityId);
            assert.equal(movedDeck.positionX, originalDeck.positionX + verb.positionX - grabbedAt.x);
            assert.equal(movedDeck.positionY, originalDeck.positionY + verb.positionY - grabbedAt.y);

            // DOWN
            verb = {
                type: testedVerbType,
                positionX: 2,
                positionY: 3,
                entityId,
                entityType,
                clientId: client.clientInfo.clientId

            }
           
            nextGameState = sharedVerbHandler.move(verb);

            movedDeck = extractDeckById(nextGameState, originalDeck.entityId);
            assert.equal(movedDeck.positionX, originalDeck.positionX + verb.positionX - grabbedAt.x);
            assert.equal(movedDeck.positionY, originalDeck.positionY + verb.positionY - grabbedAt.y);
        })
        it('should ignore input if the entityId in the input is null', function(){
            const originalState = {...gameStateStore.state}
            const verb: SharedVerb = {
                entityId: null,
                entityType: EntityTypes.CARD,
                clientId: client.clientInfo.clientId,
                type: testedVerbType,
                positionX:1,
                positionY: 1,
            }
           
            const nextGameState = sharedVerbHandler.move(verb);

            assert.deepEqual(nextGameState.cards, originalState.cards);
        })
        it('should restrict card to tables dimensions if isBound is true', function(){
            const {entityId, entityType} = boundCard;
            const {entityScale} = gameStateStore.state;
            const cardWidth = boundCard.width * entityScale;
            const cardHeight = boundCard.height * entityScale;
            let verb: SharedVerb;
            let movedCard: CardEntity;
            let nextGameState: GameState;

            gameStateStore.changeState(draft => {
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

           
            nextGameState = sharedVerbHandler.move(verb);

            movedCard = extractCardById(nextGameState, entityId);
            assert.equal(movedCard.positionX, 0);

            verb = {
                entityId: entityId,
                entityType: EntityTypes.CARD,
                clientId: client.clientInfo.clientId,
                type: testedVerbType,
                positionX: 2 * tableWidth,
                positionY: 0,
            }

           
            nextGameState = sharedVerbHandler.move(verb);

            movedCard = extractCardById(nextGameState, entityId);
            assert.equal(movedCard.positionX, tableWidth - cardWidth);

            verb = {
                entityId: entityId,
                entityType: EntityTypes.CARD,
                clientId: client.clientInfo.clientId,
                type: testedVerbType,
                positionX: 0,
                positionY: -tableHeight,
            }

           
            nextGameState = sharedVerbHandler.move(verb);

            movedCard = extractCardById(nextGameState, entityId);
            assert.equal(movedCard.positionY, 0);

            verb = {
                entityId: entityId,
                entityType: EntityTypes.CARD,
                clientId: client.clientInfo.clientId,
                type: testedVerbType,
                positionX: 0,
                positionY: 2 * tableHeight,
            }

           
            nextGameState = sharedVerbHandler.move(verb);

            movedCard = extractCardById(nextGameState, entityId);
            assert.equal(movedCard.positionY, tableHeight - cardHeight);
        });

        it('should restrict deck to tables dimensions if isBound is true', function(){
            const {entityId, entityType} = boundDeck;
            const {entityScale} = gameStateStore.state;
            const deckWidth = boundDeck.width * entityScale;
            const deckHeight = boundDeck.height * entityScale;
            let verb: SharedVerb;
            let movedDeck: DeckEntity;
            let nextGameState: GameState;

           gameStateStore.changeState(draft => {
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
           
            nextGameState = sharedVerbHandler.move(verb);

            movedDeck = extractDeckById(nextGameState, entityId);
            assert.equal(movedDeck.positionX, 0);

            verb = {
                entityId: entityId,
                entityType: EntityTypes.CARD,
                clientId: client.clientInfo.clientId,
                type: testedVerbType,
                positionX: 2 * tableWidth,
                positionY: 0,
            }

           
            nextGameState = sharedVerbHandler.move(verb);

            movedDeck = extractDeckById(nextGameState, entityId);
            assert.equal(movedDeck.positionX, tableWidth - deckWidth);

            verb = {
                entityId: entityId,
                entityType: EntityTypes.CARD,
                clientId: client.clientInfo.clientId,
                type: testedVerbType,
                positionX: 0,
                positionY: -tableHeight,
            }

           
            nextGameState = sharedVerbHandler.move(verb);

            movedDeck = extractDeckById(nextGameState, entityId);
            assert.equal(movedDeck.positionY, 0);

            verb = {
                entityId: entityId,
                entityType: EntityTypes.CARD,
                clientId: client.clientInfo.clientId,
                type: testedVerbType,
                positionX: 0,
                positionY: 2 * tableHeight,
            }

           
            nextGameState = sharedVerbHandler.move(verb);

            movedDeck = extractDeckById(nextGameState, entityId);
            assert.equal(movedDeck.positionY, tableHeight - deckHeight);
        })
    })
    //TODO: test for quick movement outside boundary. code already handles this
})