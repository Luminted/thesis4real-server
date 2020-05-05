import SocketIOClient from 'socket.io-client';
import {TableModuleClientEvents} from '../types/sockeTypes';
import {Verb, SharedVerbTypes} from '../types/verbTypes';
import { EntityTypes } from '../types/dataModelDefinitions';

const url = 'http://localhost';
const port = 8080
const namespace = '/table'
const tableId = 'dev'
const cardId = 'card-1'
const numberOfActions = 5;
const delay = 500 //in ms
const socket = SocketIOClient.connect(`${url}:${port}${namespace}`, {
    query:{
        tableId: tableId
    }
});

const grabVerb: Verb = {
    clientId: socket.id,
    entityId: cardId,
    entityType: EntityTypes.CARD,
    positionX: 0,
    positionY: 0,
    type: SharedVerbTypes.GRAB_FROM_TABLE,
}

const moveVerb: Verb = {
    clientId: socket.id,
    entityId: cardId,
    entityType: EntityTypes.CARD,
    positionX: 0,
    positionY: 0,
    type: SharedVerbTypes.MOVE,
}

const promises = [];

socket.on('connect', () => {
    console.log('agent connected');
    socket.emit(TableModuleClientEvents.VERB, grabVerb, () =>{
        for(let i=0; i < numberOfActions; i++){
            promises.push(new Promise((resolve, reject) => {
                socket.emit(TableModuleClientEvents.VERB, moveVerb, () => {
                    resolve(i);
                })
            }))
        }
        Promise.all(promises).then(res => {
            console.log(res);
        })
    })
    
})