import { TCardTable } from "../typings";


export const extractEmptySeats = (state: TCardTable) => {
    return state.emptySeats;
}

export const extractClientIdBySocketId = (state: TCardTable, socketId: string) => {
    const clientId = state.socketIdMapping[socketId];
    if(clientId){
        return clientId;
    }
    else{
       throw new Error("Entry was not found"); 
    }
}

export const extractSocketIdByClientId = (state: TCardTable, clientId: string) => {
    const {socketIdMapping} = state
    let socketId;

    Object.keys(socketIdMapping).forEach(sId => {
        if(socketIdMapping[sId] === clientId) socketId = sId;
    });

    if(socketId){
        return socketId;
    }
    else{
        throw new Error("Entry was not found");
    }
}