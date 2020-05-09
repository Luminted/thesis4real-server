import { ServerState } from "../state";

export function extractTableById(state: ServerState, tableId: string) {
    return state.tables.get(tableId);
}