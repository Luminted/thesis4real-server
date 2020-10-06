import { Singleton } from "typescript-ioc";
import { Store } from "../Store";
import { CardTable, Seats } from "../../types/dataModelDefinitions";
import { GameStateStore } from "../GameStateStore";

const initialState: CardTable = {
    gameStateStore: new GameStateStore(),
    defaultPosition: [0,0],
    seats: [Seats.NORTH, Seats.NORTH_EAST, Seats.NORTH_WEST, Seats.SOUTH, Seats.SOUTH_EAST, Seats.NORTH_WEST],
    emptySeats: [],
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