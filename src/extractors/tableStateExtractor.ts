import { entryNotFoundMessage } from "../config";
import { TCardTable } from "../typings";

export const extractEmptySeats = (state: TCardTable) => {
  return state.emptySeats;
};

export const extractClientIdBySocketId = (state: TCardTable, socketId: string) => {
  const clientId = state.socketIdMapping[socketId];
  if (clientId) {
    return clientId;
  }

  throw new Error(entryNotFoundMessage);
};

export const extractSocketIdByClientId = (state: TCardTable, clientId: string) => {
  const { socketIdMapping } = state;
  let socketId;

  Object.keys(socketIdMapping).forEach((sId) => {
    if (socketIdMapping[sId] === clientId) {
      socketId = sId;
    }
  });

  if (socketId) {
    return socketId;
  }

  throw new Error(entryNotFoundMessage);
};
