import {
  IAddCardVerb,
  IFlipVerb,
  IGrabFromHandVerb,
  IPutInHandVerb,
  IReorderHandVerb,
} from "./cardVerbs";
import {
  IGrabVerb,
  IMoveToVerb,
  IMoveVerb,
  IReleaseVerb,
  IRemoveVerb,
  IRotateVerb,
} from "./sharedVerbs";
import {
  IAddDeckVerb,
  IDrawFaceDownVerb,
  IDrawFaceUpVerb,
  IResetVerb,
  IShuffleVerb,
} from "./deckVerbs";

export interface IGenericVerb {
  type: string;
  entityId: string;
  clientId: string;
  positionX: number;
  positionY: number;
}

type TSharedVerb =
  | IGrabVerb
  | IMoveToVerb
  | IMoveVerb
  | IReleaseVerb
  | IRemoveVerb
  | IRotateVerb;
type TCardVerb =
  | IAddCardVerb
  | IFlipVerb
  | IGrabFromHandVerb
  | IPutInHandVerb
  | IReorderHandVerb;
type TDeckVerb =
  | IAddDeckVerb
  | IDrawFaceDownVerb
  | IDrawFaceUpVerb
  | IResetVerb
  | IShuffleVerb;

export type TVerb = TSharedVerb | TCardVerb | TDeckVerb;

export * from "./sharedVerbs";
export * from "./cardVerbs";
export * from "./deckVerbs";
