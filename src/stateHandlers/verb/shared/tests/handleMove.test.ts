import assert from 'assert';
import { Container } from 'typescript-ioc';
import cloneDeep from "lodash.clonedeep";
import { EEntityTypes, ICardEntity, IDeckEntity, TGameState, IMoveVerb, ESharedVerbTypes } from "../../../../typings";
import { extractClientById, extractCardById, extractDeckById } from "../../../../extractors";
import { SharedVerbHandler } from '../SharedVerbHandler';
import { mockClient1, cardEntityMock1, cardEntityMock2, deckEntityMock1, deckEntityMock2 } from '../../../../mocks';
import { GameStateStore } from '../../../../stores';

describe(`handle ${ESharedVerbTypes.MOVE}`, () =>{
    const sharedVerbHandler = new SharedVerbHandler();
    const gameStateStore = Container.get(GameStateStore); 
    const {clientInfo: {clientId}} = mockClient1;
    const boundCard = { ...cardEntityMock2};
    const boundDeck = { ...deckEntityMock2};

    beforeEach('Setting up test data...', () => {
        gameStateStore.resetState();
        gameStateStore.changeState(draft => {
            draft.cards.set(cardEntityMock1.entityId, {...cardEntityMock1});
            draft.cards.set(boundCard.entityId, boundCard);
            draft.decks.set(deckEntityMock1.entityId, {...deckEntityMock1});
            draft.decks.set(boundDeck.entityId, boundDeck);
            draft.clients.set(clientId, {...mockClient1});
        })
    })

    const testedVerbType = ESharedVerbTypes.MOVE;
    describe(`EntityType: ${EEntityTypes.CARD}`, () => {
        it('should move the correct card by the offset of input mouse position and update grabbedEntity position for correct client', () => {
            const grabbedAt = {
                x: 2,
                y: 3
            }
            let verb: IMoveVerb;
            let entityType = EEntityTypes.CARD;
            let movedCard: ICardEntity;
            let { entityId } =  cardEntityMock1;
            
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
           
            sharedVerbHandler.move(verb);

            movedCard = extractCardById(gameStateStore.state, entityId);
            assert.equal(movedCard.positionX, cardEntityMock1.positionX + verb.positionX - grabbedAt.x);
            assert.equal(movedCard.positionY, cardEntityMock1.positionY + verb.positionY - grabbedAt.y);

            // RIGHT
            verb = {
                type: testedVerbType,
                positionX: 3,
                positionY: 3,
                clientId

            }
           
            sharedVerbHandler.move(verb);

            movedCard = extractCardById(gameStateStore.state, cardEntityMock1.entityId);
            assert.equal(movedCard.positionX, cardEntityMock1.positionX + verb.positionX - grabbedAt.x);
            assert.equal(movedCard.positionY, cardEntityMock1.positionY + verb.positionY - grabbedAt.y);

            // UP
            verb = {
                type: testedVerbType,
                positionX: 2,
                positionY: 1,
                clientId

            }
          
            sharedVerbHandler.move(verb);

            movedCard = extractCardById(gameStateStore.state, cardEntityMock1.entityId);
            assert.equal(movedCard.positionX, cardEntityMock1.positionX + verb.positionX - grabbedAt.x);
            assert.equal(movedCard.positionY, cardEntityMock1.positionY + verb.positionY - grabbedAt.y);

            // DOWN
            verb = {
                type: testedVerbType,
                positionX: 2,
                positionY: 3,
                clientId

            }
           
            sharedVerbHandler.move(verb);

            movedCard = extractCardById(gameStateStore.state, cardEntityMock1.entityId);
            assert.equal(movedCard.positionX, cardEntityMock1.positionX + verb.positionX - grabbedAt.x);
            assert.equal(movedCard.positionY, cardEntityMock1.positionY + verb.positionY - grabbedAt.y);
        })
        it('should ignore input if the entityId in the input is null', () =>{
            const originalState = cloneDeep(gameStateStore.state);
            const verb: IMoveVerb = {
                clientId,
                type: testedVerbType,
                positionX:1,
                positionY: 2,
            }
           
            sharedVerbHandler.move(verb);

            assert.deepEqual(gameStateStore.state.cards, originalState.cards);
        })
    })

    describe(`EntityType: ${EEntityTypes.DECK}`, () => {
        it('should move the correct card by the offset of input mouse position and update grabbedEntity position for correct client', () => {
            const grabbedAt = {
                x: 2,
                y: 3
            }
            const entityType = EEntityTypes.DECK;
            const {entityId} = deckEntityMock2;
            let verb: IMoveVerb;
            let movedDeck: IDeckEntity;
            
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
           
            sharedVerbHandler.move(verb);

            movedDeck = extractDeckById(gameStateStore.state, entityId);
            assert.equal(movedDeck.positionX, deckEntityMock2.positionX + verb.positionX - grabbedAt.x);
            assert.equal(movedDeck.positionY, deckEntityMock2.positionY + verb.positionY - grabbedAt.y);

            // RIGHT
            verb = {
                type: testedVerbType,
                positionX: 3,
                positionY: 2,
                clientId

            }
           
            sharedVerbHandler.move(verb);

            movedDeck = extractDeckById(gameStateStore.state, deckEntityMock2.entityId);
            assert.equal(movedDeck.positionX, deckEntityMock2.positionX + verb.positionX - grabbedAt.x);
            assert.equal(movedDeck.positionY, deckEntityMock2.positionY + verb.positionY - grabbedAt.y);

            // UP
            verb = {
                type: testedVerbType,
                positionX: 2,
                positionY: 1,
                clientId

            }
           
            sharedVerbHandler.move(verb);

            movedDeck = extractDeckById(gameStateStore.state, deckEntityMock2.entityId);
            assert.equal(movedDeck.positionX, deckEntityMock2.positionX + verb.positionX - grabbedAt.x);
            assert.equal(movedDeck.positionY, deckEntityMock2.positionY + verb.positionY - grabbedAt.y);

            // DOWN
            verb = {
                type: testedVerbType,
                positionX: 2,
                positionY: 3,
                clientId

            }
           
            sharedVerbHandler.move(verb);

            movedDeck = extractDeckById(gameStateStore.state, deckEntityMock2.entityId);
            assert.equal(movedDeck.positionX, deckEntityMock2.positionX + verb.positionX - grabbedAt.x);
            assert.equal(movedDeck.positionY, deckEntityMock2.positionY + verb.positionY - grabbedAt.y);
        })
        it('should ignore input if the entityId in the input is null', () =>{
            const originalState = cloneDeep(gameStateStore.state);
            const verb: IMoveVerb = {
                clientId,
                type: testedVerbType,
                positionX:1,
                positionY: 1,
            }
           
            sharedVerbHandler.move(verb);

            assert.deepEqual(gameStateStore.state.cards, originalState.cards);
        })
    })
})