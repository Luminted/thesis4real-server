import { TSerializedGameState, ECardVerbTypes, IAddCardVerb, IGrabFromHandVerb, IPutInHandVerb, ETableClientEvents } from "../../src/typings";
import {TestClient} from "./TestClient"
import { ICardEntityMetadata, ITestClientConfig } from "../typings";

export class ToHandAdder extends TestClient {
    private grabFromHand = false;
    constructor(config: ITestClientConfig, url: string){
        super(config, url);

        this.main = () => {
            const metadata: ICardEntityMetadata = {name:"sk",type:"french", back: "bcb"}

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
                                // console.log(err)
                                if(this.isProbe) this.recordIncomingMessageTimestamp();
                            });
                        }
                        else{
                            this.grabFromHand = !this.grabFromHand;
                            this.socket.emit(ETableClientEvents.VERB, this.client.clientId, putInHandVerb, (err) => {
                                // console.log(err)
                                if(this.isProbe) this.recordIncomingMessageTimestamp();
                            })
                        }
                     }, this.messageRate);
                }
            })
        }
    }
}