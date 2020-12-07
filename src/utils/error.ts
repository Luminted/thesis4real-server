import { ECardVerbTypes, EDeckVerbTypes, ESharedVerbTypes } from "../typings";

export const getVerbErrorMessage = (verbType: ECardVerbTypes | EDeckVerbTypes | ESharedVerbTypes, reason: string) => 
    `An error happened while handling verb ${verbType}: ${reason}`