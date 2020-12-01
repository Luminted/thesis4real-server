import assert from 'assert';
import { Container } from 'typescript-ioc';
import { extractClientHandById } from '../../../../extractors/gameStateExtractors';
import { mockClient1 } from '../../../../mocks/clientMocks';
import { handCardMock1 } from '../../../../mocks/entityMocks';
import { TableStateStore } from '../../../../stores/TableStateStore';
import { CardVerbTypes, IReorderHandVerb } from '../../../../typings';
import { TableHandler } from '../../../Table';
import { CardVerbHandler } from '../CardVerbHandler';

describe(`handle ${CardVerbTypes.REORDER_HAND} verb`, () => {
    
    const cardVerbHandler = new CardVerbHandler();
    const tableHandler = new TableHandler();
    const gameStateStore = Container.get(TableStateStore).state.gameStateStore;
    const {clientInfo: {clientId}} = mockClient1;
    const verb: IReorderHandVerb = {
        type: CardVerbTypes.REORDER_HAND,
        clientId,
        order: [0,3,2,1],
    }

    beforeEach(() => {
        gameStateStore.resetState();
        gameStateStore.changeState(draft => {
            draft.clients.set(clientId, {...mockClient1});
            draft.hands.set(clientId, tableHandler.createClientHand(clientId));

            draft.hands.get(clientId).cards.push({...handCardMock1});
            draft.hands.get(clientId).cards.push({...handCardMock1});
            draft.hands.get(clientId).cards.push({...handCardMock1});
            draft.hands.get(clientId).cards.push({...handCardMock1});
        })
    })

    it("should set the ordering of clients hand to the one in the verb", () => {
        const nextState = cardVerbHandler.reorderHand(verb);

        const {ordering} = extractClientHandById(nextState ,clientId);
        assert.deepEqual(ordering, verb.order);
    })

})
