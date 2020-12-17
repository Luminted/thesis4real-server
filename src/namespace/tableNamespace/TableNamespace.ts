import throttle from "lodash.throttle";
import { SocketNamespace } from "..";
import { Singleton, Inject } from "typescript-ioc";
import {
  ETableClientEvents,
  ETableServerEvents,
  TVerb,
  TGameState,
  TClientInfo,
  TSerializedGameState,
} from "../../typings";
import { TableHandler, VerbHandler } from "../../stateHandlers";
import { ConnectionHandler } from "../../stateHandlers/connection/ConnectionHandler";
import { GameStateStore, TableStateStore } from "../../stores";
import { serverTick } from "../../config";
import { getVerbErrorMessage } from "../../utils";

@Singleton
export class TableNamespace extends SocketNamespace {
  @Inject
  private verbHandler: VerbHandler;
  @Inject
  private tableHandler: TableHandler;
  @Inject
  private connectionHandler: ConnectionHandler;
  @Inject
  private gameStateStore: GameStateStore;
  @Inject
  private tableStateStore: TableStateStore;

  constructor() {
    super();

    this.onConnect = (socket) => {
      socket.emit(
        ETableServerEvents.SYNC,
        this.serializeGameState(this.gameStateStore.state)
      );
    };

    this.addEventListenerWithSocket(
      ETableClientEvents.REJOIN_TABLE,
      (socket) => (clientId: string, ackFunction?: (error: string) => void) => {
        const { id: socketId } = socket;
        let error;
        console.log(clientId, " trying to rejoin");

        try {
          this.tableHandler.rejoin(clientId, socketId);
          this.syncGameState(this.gameStateStore.state);
          console.log(clientId, " rejoined");
        } catch (e) {
          console.log(e.message, e.stack);
          error = e.message;
        }

        if (typeof ackFunction === "function") {
          ackFunction(error);
        }
      }
    );

    this.addEventListener(
      ETableClientEvents.VERB,
      (
        verb: TVerb,
        acknowledgeFunction?: (
          error: string,
          gameState: TSerializedGameState,
          handlerReturnValue: any
        ) => void
      ) => {
        let error: string;
        let handlerReturnValue;

        try {
          handlerReturnValue = this.verbHandler.handleVerb(verb);
          this.syncGameState(this.gameStateStore.state);
        } catch (e) {
          console.log(e.message, e.stack);
          error = getVerbErrorMessage(verb.type, e.message);
        }

        if (typeof acknowledgeFunction === "function") {
          acknowledgeFunction(
            error,
            this.serializeGameState(this.gameStateStore.state),
            handlerReturnValue
          );
        }
      }
    );

    this.addEventListenerWithSocket(
      ETableClientEvents.JOIN_TABLE,
      (socket) => (
        requestedSeatId: string,
        name?: string,
        acknowledgeFunction?: (error: string, clientInfo: TClientInfo) => void
      ) => {
        const { id } = socket;
        let error: string;
        let newClientInfo: TClientInfo;

        try {
          this.tableHandler.joinTable(requestedSeatId, id, name);
          const newClientId = this.tableStateStore.state.socketIdMapping[id];
          newClientInfo = this.gameStateStore.state.clients.get(newClientId)
            .clientInfo;
          this.syncGameState(this.gameStateStore.state);
          console.log(newClientId, " joined with name ", name);
        } catch (e) {
          console.log(e.message, e.stack);

          error = e.message;
        }

        if (typeof acknowledgeFunction === "function") {
          acknowledgeFunction(error, newClientInfo);
        }
      }
    );

    this.addEventListener(
      ETableClientEvents.LEAVE_TABLE,
      (clientId: string, ackFunction?: (error: string) => void) => {
        let error;

        try {
          this.tableHandler.leaveTable(clientId);
          this.syncGameState(this.gameStateStore.state);
        } catch (e) {
          console.log(e.message, e.stack);
          error = e.message;
        }

        if (typeof ackFunction === "function") {
          ackFunction(error);
        }
      }
    );

    this.addEventListenerWithSocket(
      ETableClientEvents.DISCONNECT,
      (socket) => (reason: string) => {
        const { id } = socket;

        try {
          this.connectionHandler.disconnect(id);
          this.syncGameState(this.gameStateStore.state);
        } catch (e) {
          console.log(e.message, e.stack);
        }

        console.log(`disconnection reason: ${reason}`);
      }
    );
  }

  private syncGameState = throttle((gameState: TGameState) => {
    this.emit(ETableServerEvents.SYNC, this.serializeGameState(gameState));
  }, serverTick);

  private serializeGameState(gameState: TGameState): TSerializedGameState {
    return {
      cards: [...gameState.cards.values()],
      clients: [...gameState.clients.values()].map(
        ({ clientInfo, status }) => ({
          clientInfo,
          status,
        })
      ),
      hands: [...gameState.hands.values()],
      decks: [...gameState.decks.values()].map(({ cards: _, ...rest }) => ({
        ...rest,
      })),
    };
  }
}
