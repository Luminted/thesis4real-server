import { ECardVerbTypes, EDeckVerbTypes, ESharedVerbTypes, TCustomError } from "../typings";

export const getVerbError = (verbType: ECardVerbTypes | EDeckVerbTypes | ESharedVerbTypes, reason: string): TCustomError => ({
    message: `An error happened while handling verb ${verbType}: ${reason}`,
    code: 201
})