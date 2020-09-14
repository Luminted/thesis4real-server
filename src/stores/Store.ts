import produce, {enableMapSet} from 'immer';

enableMapSet();

export class Store<T> {
    public state: T;
    private initialState: T;

    constructor(initialState: T){
        // TODO: see if this can be initialized to an immutable object
        this.state = initialState;
        this.initialState = initialState;
    }

    public changeState(handler: (draft: T) => void) {
        this.state = produce(this.state, handler);
    } 

    public resetState() {
        this.state = this.initialState;
    }
}