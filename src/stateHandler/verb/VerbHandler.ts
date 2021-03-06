import { Inject, Singleton } from "typescript-ioc";
import { extractClientById } from "../../extractors";
import { GameStateStore } from "../../store";
import { ECardVerbTypes, EDeckVerbTypes, ESharedVerbTypes, TVerb } from "../../typings";
import { CardVerbHandler } from "./card";
import { DeckVerbHandler } from "./deck";
import { SharedVerbHandler } from "./shared";

@Singleton
export class VerbHandler {
  @Inject
  private sharedVerbHandler: SharedVerbHandler;
  @Inject
  private cardVerbHandler: CardVerbHandler;
  @Inject
  private deckVerbHandler: DeckVerbHandler;
  @Inject
  private gameStateStore: GameStateStore;

  public handleVerb(clientId: string, verb: TVerb) {
    extractClientById(this.gameStateStore.state, clientId);

    switch (verb.type) {
      case ESharedVerbTypes.GRAB:
        return this.sharedVerbHandler.grabFromTable(verb);
      case ESharedVerbTypes.RELEASE:
        return this.sharedVerbHandler.release(verb);
      case ESharedVerbTypes.MOVE:
        return this.sharedVerbHandler.move(verb);
      case ESharedVerbTypes.REMOVE:
        return this.sharedVerbHandler.remove(verb);
      case ESharedVerbTypes.MOVE_TO:
        return this.sharedVerbHandler.moveTo(verb);
      case ESharedVerbTypes.ROTATE:
        return this.sharedVerbHandler.rotate(verb);

      case EDeckVerbTypes.DRAW_FACE_UP:
        return this.deckVerbHandler.drawCard(verb, true);
      case EDeckVerbTypes.DRAW_FACE_DOWN:
        return this.deckVerbHandler.drawCard(verb, false);
      case EDeckVerbTypes.RESET:
        return this.deckVerbHandler.reset(verb);
      case EDeckVerbTypes.SHUFFLE:
        return this.deckVerbHandler.shuffle(verb);
      case EDeckVerbTypes.ADD_DECK:
        return this.deckVerbHandler.addDeck(verb);

      case ECardVerbTypes.PUT_IN_HAND:
        return this.cardVerbHandler.putInHand(verb);
      case ECardVerbTypes.GRAB_FROM_HAND:
        return this.cardVerbHandler.grabFromHand(verb);
      case ECardVerbTypes.FLIP:
        return this.cardVerbHandler.flip(verb);
      case ECardVerbTypes.REORDER_HAND:
        return this.cardVerbHandler.reorderHand(verb);
      case ECardVerbTypes.ADD_CARD:
        return this.cardVerbHandler.addCard(verb);
      default:
        return;
    }
  }
}
