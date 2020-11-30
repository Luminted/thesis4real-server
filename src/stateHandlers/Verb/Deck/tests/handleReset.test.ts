import assert from 'assert';
import {mockClient1, mockClient2} from '../../../../mocks/clientMocks';
import {deckEntityMock1, cardEntityMock1, cardEntityMock2, handCardMock1, handCardMock2} from '../../../../mocks/entityMocks';
import { DeckVerbTypes, IResetVerb } from '../../../../types/verb';
import { HandCard } from '../../../../types/dataModelDefinitions';
import { extractDeckById, extractClientHandById } from '../../../../extractors/gameStateExtractors';
import { Container } from 'typescript-ioc';
import { DeckVerbHandler } from '../DeckVerbHandler';
import { TableStateStore } from '../../../../stores/TableStateStore/TableStateStore';
import { TableHandler } from '../../../Table';


describe(`handle ${DeckVerbTypes.RESET} verb`, function() {
    const deckVerbHandler = new DeckVerbHandler();
    const tableHandler = new TableHandler();
    const gameStateStore = Container.get(TableStateStore).state.gameStateStore;
    const deckToReset = {...deckEntityMock1};
    const client1Card: HandCard = {...handCardMock1, ownerDeck: deckToReset.entityId}
    const client2Card: HandCard = {...handCardMock2, ownerDeck: deckToReset.entityId}
    const verbType = DeckVerbTypes.RESET;
    const cardsBelongingToDeck = [{...cardEntityMock1, ownerDeck: deckToReset.entityId}, {...cardEntityMock2, ownerDeck: deckToReset.entityId}];
    const client1Id = mockClient1.clientInfo.clientId;
    const client2Id = mockClient2.clientInfo.clientId;
    const verb: IResetVerb = {
        type: verbType,
        entityId: deckToReset.entityId,
    }

    beforeEach('Setting up test data...', () => {
        
        gameStateStore.resetState();
        gameStateStore.changeState(draft => {
            const client1Hand = tableHandler.createClientHand(client1Id);
            const client2Hand = tableHandler.createClientHand(client2Id);
            cardsBelongingToDeck.forEach((card => {
                draft.cards.set(card.entityId, card);
            }))
            draft.decks.set(deckToReset.entityId, deckToReset);
            draft.clients.set(client1Id, {...mockClient1});
            draft.clients.set(client2Id, {...mockClient2});
            client1Hand.cards.push({...client1Card});
            client2Hand.cards.push({...client2Card});
            client1Hand.ordering.push(0);
            client2Hand.ordering.push(0);
            draft.hands.set(client1Id, client1Hand);
            draft.hands.set(client2Id, client2Hand);
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
            draft.clients.get(mockClient1.clientInfo.clientId).grabbedEntity = {
                entityType,
                entityId,
                grabbedAtX: 0,
                grabbedAtY: 0
            };
        })
        const nextGameState = deckVerbHandler.reset(verb);
        let isRemoved = true;
        nextGameState.clients.forEach(client => {
            const {grabbedEntity: grabbedEntity} = client;
            if(grabbedEntity){
                isRemoved = isRemoved && grabbedEntity.entityId !== deckToReset.entityId
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
    it("should update hand ordering accordingly", () => {
        gameStateStore.changeState(draft => {
            const client1Hand =  extractClientHandById(draft, client1Id);
            client1Hand.cards = [{...handCardMock1, ownerDeck: deckToReset.entityId}, {...handCardMock1}, {...handCardMock1, ownerDeck: deckToReset.entityId}, {...handCardMock1}];
            client1Hand.ordering = [0,3,1,2];
        });

        const nextGameState = deckVerbHandler.reset(verb);

        const expectedOrdering = [1,0];
        const {ordering} = extractClientHandById(nextGameState, client1Id);
        assert.deepEqual(ordering, expectedOrdering);
    })

})