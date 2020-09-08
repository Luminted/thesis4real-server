import { ClientConnectionStatuses } from "../types/socketTypes";
import { Seats } from "../types/dataModelDefinitions";

export const client1 = {
    clientInfo: {
        clientId: 'client-1',
        seatedAt: Seats.NORTH,
    },
    grabbedEntitiy: null,
    status: ClientConnectionStatuses.CONNECTED
}

export const client2 = {
    clientInfo: {
        clientId: 'client-2',
        seatedAt: Seats.SOUTH,
    },
    grabbedEntitiy: null,
    status: ClientConnectionStatuses.CONNECTED
}

export const createClient = (id: string, seat: Seats = Seats.NORTH, connected: boolean = false) => ({
    clientInfo: {
        clientId: id,
        seatedAt: seat,
    },
    grabbedEntitiy: null,
    status: connected ? ClientConnectionStatuses.CONNECTED : ClientConnectionStatuses.DISCONNECTED
})