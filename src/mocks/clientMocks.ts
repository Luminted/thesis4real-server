import { Client } from "../types/dataModelDefinitions";
import { ClientConnectionStatuses } from "../types/socketTypes";

// interface ClientInfoMock extends Pick<>

export const mockClient1: Client = {
    clientInfo: {
        clientId: 'client-1',
        seatId: "1",
    },
    grabbedEntity: null,
    status: ClientConnectionStatuses.CONNECTED
}

export const mockClient2: Client = {
    clientInfo: {
        clientId: 'client-2',
        seatId: "4",
    },
    grabbedEntity: null,
    status: ClientConnectionStatuses.CONNECTED
}