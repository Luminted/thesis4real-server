import throttle from "lodash.throttle";
import { Inject, Singleton } from "typescript-ioc";
import { SocketNamespace } from "..";
import { serverTick } from "../../config";
import { ConnectionHandler, TableHandler, VerbHandler } from "../../stateHandler";
import { GameStateStore } from "../../store";
import { ETableClientEvents, ETableServerEvents, TClientInfo, TMaybeNull, TSerializedGameState, TVerb } from "../../typings";
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

  constructor() {
    super();

    this.onConnect = (socket) => {
      socket.emit(ETableServerEvents.SYNC, this.serializeGameState());
    };

    this.addEventListenerWithSocket(ETableClientEvents.REJOIN_TABLE, (socket) => (clientId: string, ackFunction?: (error: string) => void) => {
      const { id: socketId } = socket;
      let error;

      try {
        this.tableHandler.rejoin(clientId, socketId);
        this.syncGameState();
      } catch (e) {
        console.log(e.message, e.stack);
        error = e.message;
      }

      if (typeof ackFunction === "function") {
        ackFunction(error);
      }
    });

    this.addEventListenerWithSocket(ETableClientEvents.JOIN_TABLE,
      (socket) => (requestedSeatId: string, name?: string, ackFunction?: (error: TMaybeNull<string>, clientInfo: TClientInfo) => void) => {
        const { id } = socket;
        let error: string;
        let newClientInfo: TClientInfo;

        try {
          newClientInfo = this.tableHandler.joinTable(requestedSeatId, id, name);
          this.syncGameState();
        } catch (e) {
          console.log(e.message, e.stack);

          error = e.message;
        }

        if (typeof ackFunction === "function") {
          ackFunction(error, newClientInfo);
        }
      },
    );

    this.addEventListener(ETableClientEvents.LEAVE_TABLE, (clientId: string, ackFunction?: (error: TMaybeNull<string>) => void) => {
      let error;
      try {
        this.tableHandler.leaveTable(clientId);
        this.syncGameState();
      } catch (e) {
        console.log(e.message, e.stack);
        error = e.message;
      }

      if (typeof ackFunction === "function") {
        ackFunction(error);
      }
    });

    this.addEventListenerWithSocket(ETableClientEvents.DISCONNECT, (socket) => (reason: string) => {
      const { id } = socket;

      try {
        this.connectionHandler.disconnect(id);
        this.syncGameState();
      } catch (e) {
        console.log(e.message, e.stack);
      }

      console.log(`disconnection reason: ${reason}`);
    });

    this.addEventListener(ETableClientEvents.VERB, (clientId: string, verb: TVerb, ackFunction?: (error: TMaybeNull<string>, gameState: TSerializedGameState, handlerReturnValue: any) => void) => {
      let error: string;
      let handlerReturnValue;

      try {
        handlerReturnValue = this.verbHandler.handleVerb(clientId, verb);
        this.syncGameState();
      } catch (e) {
        console.log(e.message, e.stack);
        error = getVerbErrorMessage(verb.type, e.message);
      }

      if (typeof ackFunction === "function") {
        ackFunction(error, this.serializeGameState(), handlerReturnValue);
      }
    });
  }

  private syncGameState = throttle(() => {
    this.emit(ETableServerEvents.SYNC, this.serializeGameState());
  }, serverTick);

  private serializeGameState(): TSerializedGameState {
    const {cards, clients, decks, hands} = this.gameStateStore.state;
    return {
      cards: [...cards.values()],
      clients: [...clients.values()].map(({ clientInfo, status }) => ({
        clientInfo,
        status,
      })),
      hands: [...hands.values()],
      decks: [...decks.values()].map(({ cards: _, ...rest }) => ({
        ...rest,
      })),
    };
  }
}
