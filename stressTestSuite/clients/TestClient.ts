import SocketIOClient from 'socket.io-client';
import { ClientInfo } from '../../src/types/dataModelDefinitions';
import { ITestClientConfig, TMessageTimestamp } from '../typings';

export class TestClient {

    protected outgoingMessageTimestamps: TMessageTimestamp[];
    protected incomingMessageTimestamps: TMessageTimestamp[];
    protected duration: number;
    protected startDelay: number;
    protected messageRate: number;
    protected url: string;
    
    protected socket: SocketIOClient.Socket;
    protected client: ClientInfo;
    
    protected main: Function;
    protected mainInterval: any;

    private collectedResponses: [TMessageTimestamp[], TMessageTimestamp[]][];
    private outMessageId = 1;
    private inMessageId = 1;

    constructor({duration, messageRate, startDelay, url}: ITestClientConfig){
        this.duration = duration;
        this.startDelay = startDelay;
        this.messageRate = messageRate;
        this.url = url;
        this.outgoingMessageTimestamps = [];
        this.incomingMessageTimestamps = [];
        this.collectedResponses = [];
    }

    start(){

        this.socket = SocketIOClient(this.url);
        this.socket.on("connect", () => {

            setTimeout( () => {
                this.socket.emit("JOIN_TABLE", (clientInfo) => {
                    console.log("joined table", clientInfo);
                    this.client = clientInfo;
                    this.main();
                });
            }, this.startDelay);
        });

        const averagingInterval = setInterval(this.collectData.bind(this), 1000);
    
        setTimeout(() => {
            clearInterval(this.mainInterval);
            clearInterval(averagingInterval);
            this.socket.close();
        }, this.duration + 200);
    }

    getAveragesPerSecound(){
        const averages = [];
        this.collectedResponses.map((data) => {
            if(data[0].length !== 0 && data[1].length !== 0){
                const [outgoing, incoming] = this.stripMismatchingData(...data);
                const dataLength = Math.min(outgoing.length, incoming.length);
                let sum = 0;
                for(let i = 0; i < dataLength; i++){
                    sum += incoming[i].timestamp - outgoing[i].timestamp;
                }

                averages.push(sum/dataLength);
            }
        })
        return averages;
    }

    protected recordOutgoingMessageTimestamp(){
        this.outgoingMessageTimestamps.push({
            timestamp: Date.now(),
            id: this.outMessageId++
        })
    }

    protected recordIncomingMessageTimestamp(){
        this.incomingMessageTimestamps.push({
            timestamp: Date.now(),
            id: this.inMessageId++
        })
    }

    private collectData(){
        this.collectedResponses.push([this.outgoingMessageTimestamps, this.incomingMessageTimestamps]);

        this.outgoingMessageTimestamps = [];
        this.incomingMessageTimestamps = [];
    }
    
    private stripMismatchingData(data1: TMessageTimestamp[], data2: TMessageTimestamp[]){
        const dataLength = Math.min(data1.length, data2.length);

        let i = 0;
        let j = 0;

        while(data1[i].id !== data2[j].id){
            if(data1[i].id < data2[j].id){
                ++i;
            }
            if(data1[i].id > data2[j].id){
                ++j;
            }
        }
        return [[...data1.slice(i, dataLength)], [...data2.slice(j, dataLength)]];
    }
}