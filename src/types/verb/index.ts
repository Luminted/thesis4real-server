import { IAddCardVerb, IFlipVerb, IGrabFromHandVerb, IPutInHandVerb, IPutOnTableVerb, IReorderHandVerb } from "./cardVerbs";
import { IGrabVerb, IMoveToVerb, IMoveVerb, IReleaseVerb, IRemoveVerb, IRotateVerb } from "./sharedVerbs"
import { IAddDeckVerb, IDrawFaceDownVerb, IDrawFaceUpVerb, IResetVerb, IShuffleVerb } from "./deckVerbs";

export interface GenericVerb {
    type: string 
    entityId: string,
    clientId: string,
    positionX: number,
    positionY: number,
}

type SharedVerb = IGrabVerb | IMoveToVerb | IMoveVerb | IReleaseVerb | IRemoveVerb | IRotateVerb;
type CardVerb = IAddCardVerb | IFlipVerb | IGrabFromHandVerb | IPutInHandVerb | IPutOnTableVerb | IReorderHandVerb;
type DeckVerb = IAddDeckVerb | IDrawFaceDownVerb | IDrawFaceUpVerb | IResetVerb | IShuffleVerb;

export type Verb = SharedVerb | CardVerb | DeckVerb;

export * from "./sharedVerbs"
export * from "./cardVerbs";
export * from "./deckVerbs"