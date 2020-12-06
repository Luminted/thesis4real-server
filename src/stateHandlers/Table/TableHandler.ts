import { Inject } from "typescript-ioc";
import { extractClientHandCardsById, extractClientsSeatById } from "../../extractors/gameStateExtractors";
import { calcNextZIndex } from "../../utils";
import { GameStateStore } from "../../stores/GameStateStore";
import { TableStateStore } from "../../stores/TableStateStore/TableStateStore";
import { TClientHand, TClient, EClientConnectionStatuses, TMaybeNull } from "../../typings";
import { CardVerbHandler } from "../Verb/Card";
import {zIndexLimit} from "../../config";


export class TableHandler {
    @Inject
    private tableStateStore: TableStateStore;
    @Inject
    private gameStateStore: GameStateStore;
    @Inject
    private cardVerbHandler: CardVerbHandler;

    joinTable(requestedSeatId: TMaybeNull<string>, clientId: string){
        const {emptySeats} = this.tableStateStore.state;

        if(emptySeats.includes(requestedSeatId)){
            this.tableStateStore.changeState(draft => {
                    draft.emptySeats = emptySeats.filter(seatId => seatId !== requestedSeatId);
                })
            this.gameStateStore.changeState(draft => {
                const client = this.gameStateStore.state.clients.get(clientId);

                if(client){
                    throw new Error("Client has already joined Table");
                }

                const newClient = this.createClient(clientId, requestedSeatId);
                const newHand = this.createClientHand(clientId);

                draft.clients.set(clientId, newClient);
                draft.hands.set(clientId, newHand);
            })
        }
        else{
            throw new Error("Requested seat already taken");
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

    createClientHand(clientId: string): TClientHand {
        return {
            clientId,
            cards: [],
            ordering: []
        }
    }

    private createClient(id: string, seatId: string ,name?: string) {
        const newClient: TClient = {
            clientInfo: {
                seatId,
                clientId: id,
                clientName: name,
            },
            grabbedEntity: null,
            status: EClientConnectionStatuses.CONNECTED
        }
        return newClient;
    }
}