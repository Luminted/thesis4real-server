import fs from "fs";
import SocketIOClient from 'socket.io-client';
import {AllMovers} from "./scenarios/AllMovers";
import {AllAdders} from "./scenarios/AllAdders";
import {HalfMoversHalfAdders} from "./scenarios/HalfMoversHalfAdders";
import {HalfMoversHalfAddersWithCards} from "./scenarios/HalfMoversHalfAddersWithCards";
import { IAddCardVerb, ECardVerbTypes, ETableClientEvents, TClientInfo } from '../src/typings';
import {Mover, ToHandAdder} from "./clients";
import { EClientType, TScenario } from './typings';

const url = "http://localhost:8081/table"
const scenario: TScenario = HalfMoversHalfAddersWithCards;


console.log('test config');
console.log(`duration ${scenario.duration}ms`)
console.log('url ', url);
console.log('clients ', scenario.clients);
console.log('number of cards ', scenario.numberOfCards);

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
                socket.emit("VERB", clientId, addCardVerb);
            }

            console.log("preflight completed");

            socket.emit(ETableClientEvents.LEAVE_TABLE , clientId, () => {
                socket.close();
                const clients = scenario.clients.map(config => {
                    if(config.type === EClientType.MOVER){
                        return new Mover(config, url);
                    }
                    if(config.type === EClientType.TO_HAND_ADDER){
                        return new ToHandAdder(config, url);
                    }
                })
        
                console.log("spinning up test clients");
                clients.forEach(client => client.start());
                setTimeout(() => clients.forEach((client) => {
                    client.stop();
                    if(client.isProbe){
                        fs.writeFileSync(`./scenario_log.txt`, client.getAveragesPerSecound().reduce((acc, curr, index) => {
                            return `${acc}${index + 1};${curr};\n`
                        }, "seconds;latency;\n"));
                    }
                }), scenario.duration + 200);
            });
        }

    })
})