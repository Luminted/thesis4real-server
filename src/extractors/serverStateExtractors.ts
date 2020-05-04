import { ServerState } from "../state";

export function extractTableById(state: ServerState, tableId: string) {
    const table = state.tables.find(table =>{
        return  table.tableId === tableId}) 
    return table || null;
}