import SocketIOClient from 'socket.io-client';
import {fullTable1000Cards} from "./scenarios/fullTable1000Cards";
import { ClientInfo } from '../src/types/dataModelDefinitions';
import { CardVerbTypes, IAddCardVerb } from '../src/types/verb';
import {Mover, ToHandAdder} from "./clients";
import { EClientType, TScenario } from './typings';

const typeMapping = {
    mover: Mover,
    toHandAdder: ToHandAdder,
}

const url = "http://localhost:8081/table"
const scenario: TScenario = fullTable1000Cards


const socket = SocketIOClient(url);
socket.on("connect", () => {
    console.log("preflight connected")
    socket.emit("JOIN_TABLE", () => {
        console.log("preflieght join table")
        const addCardVerb: IAddCardVerb = {
            faceUp: true,
            positionX: 0,
            positionY: 0,
            rotation: 0,
            type: CardVerbTypes.ADD_CARD,
            metadata: {name:"sk",type:"french"}
        }

        console.log(scenario.numberOfCards)
        console.log(scenario)
        for(let i = 0; i < scenario.numberOfCards; i++){
            socket.emit("VERB", addCardVerb);
        }
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
        setTimeout(() => clients.forEach(client => console.log(client.getAveragesPerSecound())), 60200)
    })
})