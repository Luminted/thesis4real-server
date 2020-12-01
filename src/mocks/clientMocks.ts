import { EClientConnectionStatuses, TClient } from "../typings";

export const mockClient1: TClient = {
    clientInfo: {
        clientId: 'client-1',
        seatId: "1",
    },
    grabbedEntity: null,
    status: EClientConnectionStatuses.CONNECTED
}

export const mockClient2: TClient = {
    clientInfo: {
        clientId: 'client-2',
        seatId: "4",
    },
    grabbedEntity: null,
    status: EClientConnectionStatuses.CONNECTED
}