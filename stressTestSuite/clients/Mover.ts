import { SerializedGameState } from "../../src/types/dataModelDefinitions";
import { CardVerbTypes, IAddCardVerb, IGrabVerb, IMoveVerb, SharedVerbTypes } from "../../src/types/verb";
import { TestClient } from "./TestClient";
import { ITestClientConfig } from "../typings";

export class Mover extends TestClient {
    private moveOtherWay = false;

    constructor(config: ITestClientConfig){
        super(config);

        const metadata = {name:"sk",type:"french"}

        this.main = () => {
            const addCardVerb: IAddCardVerb = {
                type: CardVerbTypes.ADD_CARD,
                faceUp: true,
                positionX: 500,
                positionY: 500,
                rotation: 0,
                metadata
            }
            
            this.socket.emit("VERB", addCardVerb, (nextGameState: SerializedGameState) => {
                const card = nextGameState.cards.find(card => card.grabbedBy === null);
            
                    const grabVerb: IGrabVerb = {
                        type: SharedVerbTypes.GRAB,
                        clientId: this.client.clientId,
                        entityId: card.entityId,
                        entityType: card.entityType,
                        positionX: 50,
                        positionY: 50,
                    }
            
                    const moveVerb1: IMoveVerb = {
                        type: SharedVerbTypes.MOVE,
                        clientId: this.client.clientId,
                        positionX: 150,
                        positionY: 150
                    }
            
                    const moveVerb2: IMoveVerb = {
                        type: SharedVerbTypes.MOVE,
                        clientId: this.client.clientId,
                        positionX: 4,
                        positionY: 4
                    }
            
                    this.socket.emit("VERB", grabVerb);
                    
                    this.mainInterval = setInterval(() => {
                        this.recordOutgoingMessageTimestamp();
                        if(this.moveOtherWay){
                            this.socket.emit("VERB", moveVerb1, () => {
                              this.recordIncomingMessageTimestamp(); 
                            });
                        }else{
                            this.socket.emit("VERB", moveVerb2, () => {
                                this.recordIncomingMessageTimestamp();
                            });
                        }
                        this.moveOtherWay = !this.moveOtherWay;
                    }, this.messageRate);
            })
        }
    }
}