import { Inject } from "typescript-ioc";
import { generate } from "short-uuid";
import { extractSocketIdByClientId, extractClientById, extractClientHandCardsById, extractClientsSeatById } from "../../extractors";
import { calcNextZIndex } from "../../utils";
import { GameStateStore, TableStateStore } from "../../stores";
import { TClientHand, TClient, EClientConnectionStatuses, TMaybeNull } from "../../typings";
import { CardVerbHandler } from "../verb/card";
import { zIndexLimit } from "../../config";

export class TableHandler {
  @Inject
  private tableStateStore: TableStateStore;
  @Inject
  private gameStateStore: GameStateStore;
  @Inject
  private cardVerbHandler: CardVerbHandler;

  joinTable(requestedSeatId: TMaybeNull<string>, socketId: string, name?: string) {
    const { emptySeats } = this.tableStateStore.state;
    const clientId = generate();
    const presentClientId = this.tableStateStore.state.socketIdMapping[socketId];

    if (presentClientId) {
      throw new Error("Client already present");
    }

    if (emptySeats.includes(requestedSeatId)) {
      this.tableStateStore.changeState((draft) => {
        draft.emptySeats = emptySeats.filter((seatId) => seatId !== requestedSeatId);
        draft.socketIdMapping[socketId] = clientId;
      });
      this.gameStateStore.changeState((draft) => {
        const newClient = this.createClient(clientId, requestedSeatId, name);
        const newHand = this.createClientHand(clientId);

        draft.clients.set(clientId, newClient);
        draft.hands.set(clientId, newHand);
      });
    } else {
      throw new Error("Requested seat already taken");
    }

    
  }

  rejoin(clientId: string, socketId: string) {
    this.gameStateStore.changeState((draft) => {
      const client = extractClientById(draft, clientId);
      if (client.status === EClientConnectionStatuses.DISCONNECTED) {
        client.status = EClientConnectionStatuses.CONNECTED;
      } else {
        throw new Error("Client with given ID already connected");
      }
    });

    this.tableStateStore.changeState((draft) => {
      const oldSocketId = extractSocketIdByClientId(draft, clientId);
      draft.socketIdMapping[socketId] = clientId;
      delete draft.socketIdMapping[oldSocketId];
    });

    
  }

  leaveTable(clientId: string) {
    const { defaultPosition } = this.tableStateStore.state;

    // putting back seat into pool
    this.tableStateStore.changeState((draft) => {
      draft.emptySeats.push(extractClientsSeatById(this.gameStateStore.state, clientId));
      // removing socket ID mapping
      const socketId = extractSocketIdByClientId(draft, clientId);
      delete draft.socketIdMapping[socketId];
    });

    // removing hand and client
    this.gameStateStore.changeState((draft) => {
      const [positionX, positionY] = defaultPosition;
      extractClientHandCardsById(draft, clientId).forEach((handCard) => {
        const { entityId, ownerDeck, metadata } = handCard;
        const nextTopZIndex = calcNextZIndex(draft, zIndexLimit);
        const cardEntity = this.cardVerbHandler.createCardEntity(positionX, positionY, false, entityId, ownerDeck, nextTopZIndex, 0, null, metadata);
        draft.cards.set(cardEntity.entityId, cardEntity);
      });

      draft.hands.delete(clientId);
      draft.clients.delete(clientId);
    });

    
  }

  createClientHand(clientId: string): TClientHand {
    return {
      clientId,
      cards: [],
      ordering: [],
    };
  }

  private createClient(id: string, seatId: string, name?: string) {
    const newClient: TClient = {
      clientInfo: {
        seatId,
        name,
        clientId: id,
      },
      grabbedEntity: null,
      status: EClientConnectionStatuses.CONNECTED,
    };
    return newClient;
  }
}
