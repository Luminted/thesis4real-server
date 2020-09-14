import assert from 'assert';
import { cardFactory, deckFactory } from "../factories"
import { CardTypes } from "../types/dataModelDefinitions"
import { calcNextZIndex } from "./utils"
import { GameStateStore } from '../stores/GameStateStore';

describe('Testing utility functions', function(){
    describe('calcNextZIndex', function(){
        let gameStateStore = new GameStateStore();
        
        this.beforeEach(() => {
            gameStateStore.resetState();
        })

        it('should return topZIndex + 1', function(){
            const topZIndex = 2;
            const zIndexLimit = 10;
            gameStateStore.changeState(draft => {
                draft.topZIndex = topZIndex;
                const nextZIndex = calcNextZIndex(draft, zIndexLimit);
                assert.equal(nextZIndex, topZIndex + 1)
            })
        })
        it('should increment topZIndex by one', function(){
            const zIndexLimit = 10;
            const originalState = {...gameStateStore.state};
            gameStateStore.changeState(draft => {
                calcNextZIndex(draft, zIndexLimit);
                assert.equal(draft.topZIndex, originalState.topZIndex + 1);
            });
        })
        it('should set topZIndex to the number of entities and return with it if z-index limit is reached', function(){
            let numberOfEntities = 15;
            let zIndexLimit = 50;
            gameStateStore.changeState(draft => {
                for(let i = 0; i < numberOfEntities; i++){
                    const card = cardFactory(0,0,CardTypes.FRENCH);
                    draft.cards.set(card.entityId, card);
                }
                draft.topZIndex = zIndexLimit;
                const nextZIndex = calcNextZIndex(draft, zIndexLimit);
                assert.equal(draft.topZIndex, numberOfEntities);
                assert.equal(nextZIndex, numberOfEntities);
            })
        })
        it('should reset z-indexes of all entities to start from 0 in order if topZIndex reaches limit', function(){
            const zIndexLimit = 50;
            const numberOfCards = 6;
            const numberOfDecks = 4;
            const numberOfEntities = numberOfCards + numberOfDecks;
           gameStateStore.changeState(draft => {
                for(let i = 0; i < numberOfCards; i++){
                    const cardId = `${numberOfEntities - i - 1}`;
                    const card = cardFactory(0,0,CardTypes.FRENCH, undefined, undefined, cardId, undefined, undefined, undefined, zIndexLimit - i);
                    draft.cards.set(card.entityId, card);
                }
                for(let i = 0; i < numberOfDecks; i++){
                    const deckId = `${numberOfEntities - numberOfCards - i - 1}`;
                    const deck = deckFactory(CardTypes.FRENCH, 0,0, undefined, zIndexLimit - numberOfCards - i, deckId);
                    draft.decks.set(deck.entityId, deck);
                }
                draft.topZIndex = zIndexLimit;
                calcNextZIndex(draft, zIndexLimit);
                for(let i = 0; i < numberOfDecks; i++){
                    assert.equal(draft.decks.get(`${i}`).zIndex, i);
                }
                for(let i = 0; i < numberOfCards; i++){
                    assert.equal(draft.cards.get(`${i + numberOfDecks}`).zIndex, i + numberOfDecks);
                }
            })
        })
    })
})