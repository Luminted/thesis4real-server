import SocketIOClient from 'socket.io-client';
import {TableModuleClientEvents} from '../src/types/sockeTypes';
import {Verb, SharedVerbTypes} from '../src/types/verbTypes';
import {EntityTypes} from '../src/types/dataModelDefinitions';
import {AgentConfig} from './types';
import ora from 'ora'

for(let i = 0; i < 1; i++){
    const agentConfig: AgentConfig = {
        tableId: 'dev1',
        cardId: 'card-' + i,
        duration: 60000,
        frequency: 1000 /60,
        host: 'http://localhost',
        port: 8080
    }
    launchAgent(agentConfig)
    .then(promises => {
        // console.log(promises)
        console.log('resolving promises ', promises.length)
        return Promise.all(promises);
    })
    .then(measurements => {
        console.log('processing results');
        const avg = measurements.map(m => m[1] - m[0]).reduce((acc, curr) => acc + curr, 0) / measurements.length;
        console.log(`AVG latency: ${avg}`);
    })
    .catch(err => console.log(err))
}
// for(let i = 0; i < 6; i++){
//     const agentConfig: AgentConfig = {
//         tableId: 'dev2',
//         cardId: 'card-' + i,
//         duration: 10000,
//         frequency: 1000 / 60,
//         host: 'http://localhost',
//         port: 8080
//     }
//     launchAgent(agentConfig)
//     .then(promises => {
//         // console.log(promises)
//         console.log('resolving promises')
//         return Promise.all(promises)
//     })
//     .then(measurements => {
//         console.log('processing results');
//         const avg = measurements.map(m => m[1] - m[0]).reduce((acc, curr) => acc + curr, 0) / measurements.length;
//         console.log(`AVG latency: ${avg}`);
//     })
//     .catch(err => console.log(err))
// }

async function launchAgent(config: AgentConfig): Promise<Promise<[number,number]>[]> {
    const {
        port,
        host,
        tableId,
        cardId,
        duration,
        frequency
    } = config;
    const socket = SocketIOClient.connect(`${host}:${port}/table`, {
        query: {
            tableId
        }
    });

    return await new Promise((resolve, reject) => {
        socket.on('connect', () => {
            console.log('agent connected')
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


            const acknowledgedEmits = [];
            let passedMillisecs = 0;
            socket.emit(TableModuleClientEvents.JOIN_TABLE, () => {
                socket.emit(TableModuleClientEvents.VERB, grabVerb, () => {
                    const interval = setInterval(() => {
                        if (passedMillisecs > duration) {
                            clearInterval(interval);
                            socket.close();
                            resolve(acknowledgedEmits.slice(0, acknowledgedEmits.length - 2));
                        }
                        acknowledgedEmits.push(new Promise((resolve, reject) => {
                            const startTime = Date.now();
                            socket.emit(TableModuleClientEvents.VERB, moveVerb, () => {
                                resolve([startTime, Date.now()]);
                            })
                        }));
                        passedMillisecs += frequency;
                        // console.log(passedMillisecs)
                    }, frequency)
                })
            })
        })
    })
}