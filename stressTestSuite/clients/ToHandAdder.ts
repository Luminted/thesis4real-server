import { TSerializedGameState, ECardVerbTypes, IAddCardVerb, IGrabFromHandVerb, IGrabVerb, IPutInHandVerb, ESharedVerbTypes, ETableClientEvents } from "../../src/typings";
import {TestClient} from "./TestClient"
import { ITestClientConfig } from "../typings";

export class ToHandAdder extends TestClient {
    private grabFromHand = false;
    constructor(config: ITestClientConfig){
        super(config);

        this.main = () => {
            const metadata = {name:"sk",type:"french"}

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
                
                    const putInHandVerb: IPutInHandVerb = {
                        clientId: this.client.clientId,
                        entityId: card.entityId,
                        type: ECardVerbTypes.PUT_IN_HAND,
                        toHandOf: this.client.clientId,
                        faceUp: true
                    }
    
                    const grabFromHandVerb: IGrabFromHandVerb = {
                        clientId: this.client.clientId,
                        entityId: card.entityId,
                        grabbedAtX: 0,
                        grabbedAtY: 0,
                        grabbedFrom: this.client.clientId,
                        positionX: 0,
                        positionY: 0,
                        type: ECardVerbTypes.GRAB_FROM_HAND,
                        faceUp: true
                    }
    
                    this.mainInterval = setInterval(() => {
                        this.recordOutgoingMessageTimestamp();
                        if(this.grabFromHand){
                            this.grabFromHand = !this.grabFromHand;
                            this.socket.emit(ETableClientEvents.VERB, this.client.clientId, grabFromHandVerb, () => {
                                this.recordIncomingMessageTimestamp();
                            });
                        }
                        else{
                            this.grabFromHand = !this.grabFromHand;
                            this.socket.emit(ETableClientEvents.VERB, this.client.clientId, putInHandVerb, () => {
                                this.recordIncomingMessageTimestamp();
                            })
                        }
                     }, this.messageRate);
                }
            })
        }
    }
}