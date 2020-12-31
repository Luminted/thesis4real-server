import { TSerializedGameState, ECardVerbTypes, IAddCardVerb, IGrabVerb, IMoveVerb, ESharedVerbTypes, ETableClientEvents } from "../../src/typings";
import { TestClient } from "./TestClient";
import { ITestClientConfig } from "../typings";

export class Mover extends TestClient {
    private moveOtherWay = false;

    constructor(config: ITestClientConfig){
        super(config);

        const metadata = {name:"sk",type:"french"}

        this.main = () => {
            const addCardVerb: IAddCardVerb = {
                type: ECardVerbTypes.ADD_CARD,
                faceUp: true,
                positionX: 500,
                positionY: 500,
                rotation: 0,
                metadata
            }
            
            this.socket.emit(ETableClientEvents.VERB, this.client.clientId, addCardVerb, (err, nextGameState: TSerializedGameState, newCardId: string) => {
                if(err){
                    console.log(err);
                }
                else{
                    const card = nextGameState.cards.find(card => card.entityId === newCardId);
                
                    const grabVerb: IGrabVerb = {
                        type: ESharedVerbTypes.GRAB,
                        clientId: this.client.clientId,
                        entityId: card.entityId,
                        entityType: card.entityType,
                        positionX: 50,
                        positionY: 50,
                    }
            
                    const moveVerb1: IMoveVerb = {
                        type: ESharedVerbTypes.MOVE,
                        clientId: this.client.clientId,
                        positionX: 150,
                        positionY: 150
                    }
            
                    const moveVerb2: IMoveVerb = {
                        type: ESharedVerbTypes.MOVE,
                        clientId: this.client.clientId,
                        positionX: 4,
                        positionY: 4
                    }
            
                    this.socket.emit(ETableClientEvents.VERB, this.client.clientId, grabVerb, err => {
                        if(!err){
                            this.mainInterval = setInterval(() => {
                                this.recordOutgoingMessageTimestamp();
                                if(this.moveOtherWay){
                                    this.socket.emit(ETableClientEvents.VERB, this.client.clientId, moveVerb1, () => {
                                        this.recordIncomingMessageTimestamp(); 
                                    });
                                }else{
                                    this.socket.emit(ETableClientEvents.VERB, this.client.clientId, moveVerb2, () => {
                                        this.recordIncomingMessageTimestamp();
                                    });
                                }
                                this.moveOtherWay = !this.moveOtherWay;
                            }, this.messageRate);
                        }
                        else{
                            console.log(err);
                        }
                    });
                    
                }
            })
        }
    }
}