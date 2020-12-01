import { Singleton } from "typescript-ioc";
import { Store } from "../Store";
import {numberOfSeats} from "../../config";
import { TCardTable } from "../../typings";
import { GameStateStore } from "../GameStateStore";

const initialState: TCardTable = {
    gameStateStore: new GameStateStore(),
    defaultPosition: [0,0],
    emptySeats: new Array(numberOfSeats).fill(null).map((_, index) => `${index + 1}`),
};

@Singleton
export class TableStateStore extends Store<TCardTable>{

    constructor(){
        super(initialState);
    }

    get gameStateStore() {
        return this.state.gameStateStore;
    }

}