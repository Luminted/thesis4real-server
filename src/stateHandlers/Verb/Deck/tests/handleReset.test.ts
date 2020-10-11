import assert from 'assert';
import {mockClient1, mockClient2} from '../../../../mocks/clientMocks';
import {deckEntityMock1, cardEntityMock1, cardEntityMock2, handCardMock1, handCardMock2} from '../../../../mocks/entityMocks';
import { DeckVerbTypes, IResetVerb } from '../../../../types/verb';
import { EntityTypes, HandCard } from '../../../../types/dataModelDefinitions';
import { createClientHand } from '../../../../factories';
import { extractDeckById, extractClientHandById } from '../../../../extractors/gameStateExtractors';
import { Container } from 'typescript-ioc';
import { DeckVerbHandler } from '../DeckVerbHandler';
import { TableStateStore } from '../../../../stores/TableStateStore/TableStateStore';


describe(`handle ${DeckVerbTypes.RESET} verb`, function() {
    const deckVerbHandler = new DeckVerbHandler();
    const gameStateStore = Container.get(TableStateStore).state.gameStateStore;
    const deckToReset = {...deckEntityMock1};
    const client1Card: HandCard = {...handCardMock1, ownerDeck: deckToReset.entityId}
    const client2Card: HandCard = {...handCardMock2, ownerDeck: deckToReset.entityId}
    const verbType = DeckVerbTypes.RESET;
    const cardsBelongingToDeck = [{...cardEntityMock1, ownerDeck: deckToReset.entityId}, {...cardEntityMock2, ownerDeck: deckToReset.entityId}];
    const verb: IResetVerb = {
        type: verbType,
        entityId: deckToReset.entityId,
    }

    beforeEach('Setting up test data...', () => {
        const client1Id = mockClient1.clientInfo.clientId;
        const client2Id = mockClient2.clientInfo.clientId;
        
        gameStateStore.resetState();
        gameStateStore.changeState(draft => {
            cardsBelongingToDeck.forEach((card => {
                draft.cards.set(card.entityId, card);
            }))
            draft.decks.set(deckToReset.entityId, deckToReset);
            draft.clients.set(client1Id, {...mockClient1});
            draft.clients.set(client2Id, {...mockClient2});
            draft.hands.set(client1Id, createClientHand(client1Id));
            draft.hands.set(client2Id, createClientHand(client2Id));
            draft.hands.get(client1Id).cards.push({...client1Card});
            draft.hands.get(client2Id).cards.push({...client2Card});
        })
    })

    it('should remove all cards off the table belonging to the reset deck', function() {
        const nextGameState = deckVerbHandler.reset(verb);
        for(const card of cardsBelongingToDeck){
            assert.equal(nextGameState.cards.has(card.entityId), false);
        }
    })

    it('should remove grabbed cards belonging to the reset deck', function(){
        const grabbedCard = {...cardEntityMock1, entityId: "grabbedCard-id"}
       gameStateStore.changeState(draft => {
            const {entityId, entityType} = grabbedCard; 
            draft.clients.get(mockClient1.clientInfo.clientId).grabbedEntitiy = {
                entityType,
                entityId,
                grabbedAtX: 0,
                grabbedAtY: 0
            };
        })
        const nextGameState = deckVerbHandler.reset(verb);
        let isRemoved = true;
        nextGameState.clients.forEach(client => {
            const {grabbedEntitiy} = client;
            if(grabbedEntitiy){
                isRemoved = isRemoved && grabbedEntitiy.entityId !== deckToReset.entityId
            }
        })
        assert.equal(isRemoved, true);
    })

    it('should remove all cards out of player hands belonging to the reset deck', function(){
        const nextGameState = deckVerbHandler.reset(verb);
        assert.equal(extractClientHandById(nextGameState, mockClient1.clientInfo.clientId).cards.some(card => card.entityId === client1Card.entityId), false);
        assert.equal(extractClientHandById(nextGameState, mockClient2.clientInfo.clientId).cards.some(card => card.entityId === client2Card.entityId), false);
    })
    it('should set drawIndex to 0', function(){
        const nextGameState = deckVerbHandler.reset(verb);
        const resetDeck = extractDeckById(nextGameState, deckToReset.entityId);
        assert.equal(resetDeck.drawIndex, 0);
    })

})