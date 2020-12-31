import SocketIOClient from 'socket.io-client';
import { ETableClientEvents, ETableServerEvents, TClientInfo } from '../../src/typings';
import { ITestClientConfig } from '../typings';

export class TestClient {

    protected incomingMessageTimestamps: {[key in number]: number};
    protected outgoingMessageTimestamps: {[key in number]: number};
    protected duration: number;
    protected startDelay: number;
    protected messageRate: number;
    protected url: string;
    protected seatId: string;
    
    protected socket: SocketIOClient.Socket;
    protected client: TClientInfo;
    
    protected main: Function;
    protected mainInterval: any;

    private collectedResponses: [{[key in number]: number}, {[key in number]: number}][];
    private incomingMessageId = 1;
    private outgoingMessageId = 1;

    constructor({duration, messageRate, startDelay, url, seatId}: ITestClientConfig){
        this.duration = duration;
        this.startDelay = startDelay;
        this.messageRate = messageRate;
        this.url = url;
        this.seatId = seatId;
        this.incomingMessageTimestamps = {};
        this.outgoingMessageTimestamps = {};
        this.collectedResponses = [];
    }

    start(){
        this.socket = SocketIOClient(this.url);
        this.socket.on(ETableServerEvents.CONNECT, () => {
            setTimeout( () => {
                this.socket.emit(ETableClientEvents.JOIN_TABLE, this.seatId, undefined, (err, clientInfo) => {
                    if(!err){
                        this.client = clientInfo;
                        this.main();
                    }
                    else{
                        console.log(err);
                    }
                });
            }, this.startDelay);
        });

        const averagingInterval = setInterval(this.collectData.bind(this), 1000);
    
        setTimeout(() => {
            clearInterval(this.mainInterval);
            clearInterval(averagingInterval);
        }, this.duration);
    }

    stop(){
        console.log("stopping client");
        this.socket.emit(ETableClientEvents.LEAVE_TABLE, this.client.clientId, () => {
            this.socket.close();
        });
    }

    getAveragesPerSecound(){
        const averages = [];
        this.collectedResponses.forEach((sample) => {
            const [outgoingTimestamps, incomingTimestamps] = sample;
            const keys = Object.keys(outgoingTimestamps);
            let sum = 0;
            let usableMeasurements = 0;
            keys.forEach(key => {
                const outgoingTimestamp = outgoingTimestamps[key];
                const incomingTimestamp = incomingTimestamps[key];
                if(incomingTimestamp){
                    sum += incomingTimestamp - outgoingTimestamp;
                    usableMeasurements += 1;
                }
            })
            const avg = sum / usableMeasurements;
            if(!isNaN(avg)){
                averages.push(avg);
            }
        })
        return averages;
    }

    private collectData(){
        this.collectedResponses.push([this.outgoingMessageTimestamps, this.incomingMessageTimestamps]);

        this.incomingMessageTimestamps = {};
        this.outgoingMessageTimestamps = {};
    }

    protected recordIncomingMessageTimestamp(){
        this.incomingMessageTimestamps[this.incomingMessageId] = Date.now();
        this.incomingMessageId += 1;
    }

    protected recordOutgoingMessageTimestamp(){
        this.outgoingMessageTimestamps[this.outgoingMessageId] = Date.now();
        this.outgoingMessageId += 1;
    }
}