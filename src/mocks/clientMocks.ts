import { ClientConnectionStatuses } from "../types/socketTypes";
import { Seats } from "../types/dataModelDefinitions";

export const mockClient1 = {
    clientInfo: {
        clientId: 'client-1',
        seatedAt: Seats.NORTH,
    },
    grabbedEntitiy: null,
    status: ClientConnectionStatuses.CONNECTED
}

export const mockClient2 = {
    clientInfo: {
        clientId: 'client-2',
        seatedAt: Seats.SOUTH,
    },
    grabbedEntitiy: null,
    status: ClientConnectionStatuses.CONNECTED
}