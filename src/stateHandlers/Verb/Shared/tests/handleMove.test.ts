import assert from 'assert';
import { Container } from 'typescript-ioc';
import { EntityTypes, CardEntity, DeckEntity, GameState, IMoveVerb, SharedVerbTypes } from "../../../../typings";
import { extractClientById, extractCardById, extractDeckById } from "../../../../extractors/gameStateExtractors";
import { mockClient1 } from "../../../../mocks/clientMocks";
import { SharedVerbHandler } from '../SharedVerbHandler';
import { TableStateStore } from '../../../../stores/TableStateStore';
import { cardEntityMock1, cardEntityMock2, deckEntityMock1, deckEntityMock2 } from '../../../../mocks/entityMocks';

describe(`handle ${SharedVerbTypes.MOVE}`, () =>{
    const sharedVerbHandler = new SharedVerbHandler();
    const tableStateStore = Container.get(TableStateStore); 
    const gameStateStore = tableStateStore.state.gameStateStore;
    const {clientInfo: {clientId}} = mockClient1;
    const boundCard = { ...cardEntityMock2};
    const boundDeck = { ...deckEntityMock2};
    const entityScale = 2;

    beforeEach('Setting up test data...', () => {
        gameStateStore.resetState();
        gameStateStore.changeState(draft => {
            draft.cards.set(cardEntityMock1.entityId, {...cardEntityMock1});
            draft.cards.set(boundCard.entityId, boundCard);
            draft.decks.set(deckEntityMock1.entityId, {...deckEntityMock1});
            draft.decks.set(boundDeck.entityId, boundDeck);
            draft.clients.set(clientId, {...mockClient1});
            draft.entityScale = entityScale;
        })
    })

    const testedVerbType = SharedVerbTypes.MOVE;
    describe(`EntityType: ${EntityTypes.CARD}`, () => {
        it('should move the correct card by the offset of input mouse position and update grabbedEntity position for correct client', () => {
            const grabbedAt = {
                x: 2,
                y: 3
            }
            let verb: IMoveVerb;
            let entityType = EntityTypes.CARD;
            let movedCard: CardEntity;
            let { entityId } =  cardEntityMock1;
            let nextGameState: GameState;
            
            gameStateStore.changeState(draft => {
                extractClientById(draft, clientId).grabbedEntity = {
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
                clientId
            }
           
            nextGameState = sharedVerbHandler.move(verb);

            movedCard = extractCardById(nextGameState, entityId);
            assert.equal(movedCard.positionX, cardEntityMock1.positionX + verb.positionX - grabbedAt.x);
            assert.equal(movedCard.positionY, cardEntityMock1.positionY + verb.positionY - grabbedAt.y);

            // RIGHT
            verb = {
                type: testedVerbType,
                positionX: 3,
                positionY: 3,
                clientId

            }
           
            nextGameState = sharedVerbHandler.move(verb);

            movedCard = extractCardById(nextGameState, cardEntityMock1.entityId);
            assert.equal(movedCard.positionX, cardEntityMock1.positionX + verb.positionX - grabbedAt.x);
            assert.equal(movedCard.positionY, cardEntityMock1.positionY + verb.positionY - grabbedAt.y);

            // UP
            verb = {
                type: testedVerbType,
                positionX: 2,
                positionY: 1,
                clientId

            }
          
            nextGameState = sharedVerbHandler.move(verb);

            movedCard = extractCardById(nextGameState, cardEntityMock1.entityId);
            assert.equal(movedCard.positionX, cardEntityMock1.positionX + verb.positionX - grabbedAt.x);
            assert.equal(movedCard.positionY, cardEntityMock1.positionY + verb.positionY - grabbedAt.y);

            // DOWN
            verb = {
                type: testedVerbType,
                positionX: 2,
                positionY: 3,
                clientId

            }
           
            nextGameState = sharedVerbHandler.move(verb);

            movedCard = extractCardById(nextGameState, cardEntityMock1.entityId);
            assert.equal(movedCard.positionX, cardEntityMock1.positionX + verb.positionX - grabbedAt.x);
            assert.equal(movedCard.positionY, cardEntityMock1.positionY + verb.positionY - grabbedAt.y);
        })
        it('should ignore input if the entityId in the input is null', () =>{
            const originalState = {...gameStateStore.state};
            const verb: IMoveVerb = {
                clientId,
                type: testedVerbType,
                positionX:1,
                positionY: 2,
            }
           
            const nextGameState = sharedVerbHandler.move(verb);

            assert.deepEqual(nextGameState.cards, originalState.cards);
        })
    })

    describe(`EntityType: ${EntityTypes.DECK}`, () => {
        it('should move the correct card by the offset of input mouse position and update grabbedEntity position for correct client', () => {
            const grabbedAt = {
                x: 2,
                y: 3
            }
            const entityType = EntityTypes.DECK;
            const {entityId} = deckEntityMock2;
            let verb: IMoveVerb;
            let movedDeck: DeckEntity;
            let nextGameState: GameState;
            
            gameStateStore.changeState(draft => {
            extractClientById(draft, clientId).grabbedEntity = {
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
                clientId
            }
           
            nextGameState = sharedVerbHandler.move(verb);

            movedDeck = extractDeckById(nextGameState, entityId);
            assert.equal(movedDeck.positionX, deckEntityMock2.positionX + verb.positionX - grabbedAt.x);
            assert.equal(movedDeck.positionY, deckEntityMock2.positionY + verb.positionY - grabbedAt.y);

            // RIGHT
            verb = {
                type: testedVerbType,
                positionX: 3,
                positionY: 2,
                clientId

            }
           
            nextGameState = sharedVerbHandler.move(verb);

            movedDeck = extractDeckById(nextGameState, deckEntityMock2.entityId);
            assert.equal(movedDeck.positionX, deckEntityMock2.positionX + verb.positionX - grabbedAt.x);
            assert.equal(movedDeck.positionY, deckEntityMock2.positionY + verb.positionY - grabbedAt.y);

            // UP
            verb = {
                type: testedVerbType,
                positionX: 2,
                positionY: 1,
                clientId

            }
           
            nextGameState = sharedVerbHandler.move(verb);

            movedDeck = extractDeckById(nextGameState, deckEntityMock2.entityId);
            assert.equal(movedDeck.positionX, deckEntityMock2.positionX + verb.positionX - grabbedAt.x);
            assert.equal(movedDeck.positionY, deckEntityMock2.positionY + verb.positionY - grabbedAt.y);

            // DOWN
            verb = {
                type: testedVerbType,
                positionX: 2,
                positionY: 3,
                clientId

            }
           
            nextGameState = sharedVerbHandler.move(verb);

            movedDeck = extractDeckById(nextGameState, deckEntityMock2.entityId);
            assert.equal(movedDeck.positionX, deckEntityMock2.positionX + verb.positionX - grabbedAt.x);
            assert.equal(movedDeck.positionY, deckEntityMock2.positionY + verb.positionY - grabbedAt.y);
        })
        it('should ignore input if the entityId in the input is null', () =>{
            const originalState = {...gameStateStore.state}
            const verb: IMoveVerb = {
                clientId,
                type: testedVerbType,
                positionX:1,
                positionY: 1,
            }
           
            const nextGameState = sharedVerbHandler.move(verb);

            assert.deepEqual(nextGameState.cards, originalState.cards);
        })
    })
})