import { Inject } from "typescript-ioc";
import { extractClientHandCardsById, extractClientsSeatById } from "../../extractors/gameStateExtractors";
import { calcNextZIndex } from "../../utils";
import { GameStateStore } from "../../stores/GameStateStore";
import { TableStateStore } from "../../stores/TableStateStore/TableStateStore";
import { ClientHand, Client, ClientConnectionStatuses } from "../../typings";
import { CardVerbHandler } from "../Verb/Card";
import {zIndexLimit} from "../../config";


export class TableHandler {
    @Inject
    private tableStateStore: TableStateStore;
    @Inject
    private cardVerbHandler: CardVerbHandler;
    private gameStateStore: GameStateStore;

    constructor(){
        this.gameStateStore = this.tableStateStore.state.gameStateStore;
    }

    joinTable(clientId: string){
        let emptySeatId;
        this.tableStateStore.changeState(draft => {
            emptySeatId = draft.emptySeats.pop();
        })
        if(emptySeatId !== undefined){
            this.gameStateStore.changeState(draft => {
                const newClient = this.createClient(clientId, emptySeatId);
                const newHand = this.createClientHand(clientId);
                draft.clients.set(clientId, newClient);
                draft.hands.set(clientId, newHand);
            })
        }
        else{
            // throw error
        }

        return this.gameStateStore.state;
    }

    leaveTable(clientId: string){
        const {defaultPosition} = this.tableStateStore.state;

        // putting back seat into pool
        this.tableStateStore.changeState(draft => {
            draft.emptySeats.push(extractClientsSeatById(this.gameStateStore.state, clientId));
        })

        // removing hand and client
        this.gameStateStore.changeState(draft => {
            const [positionX, positionY] = defaultPosition;
            extractClientHandCardsById(draft, clientId).forEach(handCard => {
                const { entityId, ownerDeck, metadata} = handCard;
                const nextTopZIndex = calcNextZIndex(draft, zIndexLimit);
                const cardEntity = this.cardVerbHandler.createCardEntity(positionX, positionY, false, entityId, ownerDeck, nextTopZIndex, 0, null, metadata);
                draft.cards.set(cardEntity.entityId, cardEntity);
            });
        
            draft.hands.delete(clientId);
            draft.clients.delete(clientId);
        });

        return this.gameStateStore.state;
    }

    createClientHand(clientId: string): ClientHand {
        return {
            clientId,
            cards: [],
            ordering: []
        }
    }

    private createClient(id: string, seatId: string ,name?: string) {
        const newClient: Client = {
            clientInfo: {
                seatId,
                clientId: id,
                clientName: name,
            },
            grabbedEntity: null,
            status: ClientConnectionStatuses.CONNECTED
        }
        return newClient;
    }
}