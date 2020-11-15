import { Singleton } from "typescript-ioc";
import { Store } from "../Store";
import {numberOfSeats} from "../../config";
import { CardTable } from "../../types/dataModelDefinitions";
import { GameStateStore } from "../GameStateStore";

const initialState: CardTable = {
    gameStateStore: new GameStateStore(),
    defaultPosition: [0,0],
    emptySeats: new Array(numberOfSeats).fill(null).map((_, index) => `${index + 1}`),
};

@Singleton
export class TableStateStore extends Store<CardTable>{

    constructor(){
        super(initialState);
    }

    get gameStateStore() {
        return this.state.gameStateStore;
    }

}