import { generate } from "short-uuid";
import { Inject } from "typescript-ioc";
import { clientAlreadyConnectedMessage, clientAlreadyPresentMessage, seatTakenMessage, zIndexLimit } from "../../config";
import { extractClientById, extractClientHandCardsById, extractClientsSeatById, extractSocketIdByClientId } from "../../extractors";
import { GameStateStore, TableStateStore } from "../../store";
import { EClientConnectionStatuses, TClient, TClientHand, TClientInfo, TMaybeNull } from "../../typings";
import { calcNextZIndex } from "../../utils";
import { CardVerbHandler } from "../verb/card";

export class TableHandler {
  @Inject
  private tableStateStore: TableStateStore;
  @Inject
  private gameStateStore: GameStateStore;
  @Inject
  private cardVerbHandler: CardVerbHandler;

  public joinTable(requestedSeatId: TMaybeNull<string>, socketId: string, name?: string) {
    const { emptySeats } = this.tableStateStore.state;
    const clientId = generate();
    const presentClientId = this.tableStateStore.state.socketIdMapping[socketId];
    let newClientInfo: TClientInfo;

    if (presentClientId) {
      throw new Error(clientAlreadyPresentMessage);
    }

    if (emptySeats.includes(requestedSeatId)) {
      this.tableStateStore.changeState((draft) => {
        draft.emptySeats = emptySeats.filter((seatId) => seatId !== requestedSeatId);
        draft.socketIdMapping[socketId] = clientId;
      });
      this.gameStateStore.changeState((draft) => {
        const newClient = this.createClient(clientId, requestedSeatId, name);
        const newHand = this.createClientHand(clientId);
        newClientInfo = newClient.clientInfo;

        draft.clients.set(clientId, newClient);
        draft.hands.set(clientId, newHand);
      });
    } else {
      throw new Error(seatTakenMessage);
    }

    return newClientInfo;
  }

  public rejoin(clientId: string, socketId: string) {
    this.gameStateStore.changeState((draft) => {
      const client = extractClientById(draft, clientId);
      if (client.status === EClientConnectionStatuses.DISCONNECTED) {
        client.status = EClientConnectionStatuses.CONNECTED;
      } else {
        throw new Error(clientAlreadyConnectedMessage);
      }
    });

    this.tableStateStore.changeState((draft) => {
      const oldSocketId = extractSocketIdByClientId(draft, clientId);
      draft.socketIdMapping[socketId] = clientId;
      delete draft.socketIdMapping[oldSocketId];
    });
  }

  public leaveTable(clientId: string) {
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

  public createClientHand(clientId: string): TClientHand {
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
