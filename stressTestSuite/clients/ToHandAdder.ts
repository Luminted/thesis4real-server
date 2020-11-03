import { SerializedGameState } from "../../src/types/dataModelDefinitions";
import { CardVerbTypes, IAddCardVerb, IGrabFromHandVerb, IGrabVerb, IPutInHandVerb, SharedVerbTypes } from "../../src/types/verb";
import {TestClient} from "./TestClient"
import { ITestClientConfig } from "../typings";

export class ToHandAdder extends TestClient {
    private grabFromHand = false;
    constructor(config: ITestClientConfig){
        super(config);

        this.main = () => {
            const metadata = {name:"sk",type:"french"}

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
            
                    const putInHandVerb: IPutInHandVerb = {
                        clientId: this.client.clientId,
                        entityId: card.entityId,
                        type: CardVerbTypes.PUT_IN_HAND
                    }

                    const grabFromHandVerb: IGrabFromHandVerb = {
                        clientId: this.client.clientId,
                        entityId: card.entityId,
                        grabbedAtX: 0,
                        grabbedAtY: 0,
                        grabbedFrom: this.client.clientId,
                        positionX: 0,
                        positionY: 0,
                        type: CardVerbTypes.GRAB_FROM_HAND
                    }

                    this.mainInterval = setInterval(() => {
                        this.recordOutgoingMessageTimestamp();
                        if(this.grabFromHand){
                            this.grabFromHand = !this.grabFromHand;
                            this.socket.emit("VERB", grabFromHandVerb, () => {
                                this.recordIncomingMessageTimestamp();
                            });
                        }
                        else{
                            this.grabFromHand = !this.grabFromHand;
                            this.socket.emit("VERB", putInHandVerb, () => {
                                this.recordIncomingMessageTimestamp();
                            })
                        }
                    }, this.messageRate);
                })
        }
    }
}