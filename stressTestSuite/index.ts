import SocketIOClient from 'socket.io-client';
import {fullTable1000Cards} from "./scenarios/fullTable1000Cards";
import { IAddCardVerb, ECardVerbTypes, ETableClientEvents, TClientInfo } from '../src/typings';
import {Mover, ToHandAdder} from "./clients";
import { EClientType, TScenario } from './typings';

const url = "http://localhost:8083/table"
const scenario: TScenario = fullTable1000Cards;

console.log(`test duration ${scenario.duration}ms`)

const socket = SocketIOClient(url);
socket.on("connect", () => {
    socket.emit(ETableClientEvents.JOIN_TABLE, "1", undefined, (err, clientInfo: TClientInfo) => {
        if(err){
            console.log(err);
        }
        else{
            const {clientId} = clientInfo;
    
            const addCardVerb: IAddCardVerb = {
                faceUp: true,
                positionX: 0,
                positionY: 0,
                rotation: 0,
                type: ECardVerbTypes.ADD_CARD,
                metadata: {name:"sk",type:"french"}
            }
    
            for(let i = 0; i < scenario.numberOfCards; i++){
                socket.emit("VERB", addCardVerb);
            }
            socket.emit(ETableClientEvents.LEAVE_TABLE , clientId, () => {
                socket.close();
                const clients = scenario.clients.map(config => {
                    if(config.type === EClientType.MOVER){
                        return new Mover(config);
                    }
                    if(config.type === EClientType.TO_HAND_ADDER){
                        return new ToHandAdder(config);
                    }
                })
        
                clients.forEach(client => client.start());
                setTimeout(() => clients.forEach(client => {
                    client.stop();
                    console.log(client.getAveragesPerSecound())
                }), scenario.duration + 200);
            });
        }

    })
})