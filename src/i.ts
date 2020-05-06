import uuidv4 from 'uuid/v4';


import produce, { original, setAutoFreeze } from 'immer';
import {empty, set, get, remove, forEach} from '@typed/hashmap'
import uuid from 'uuid';
import Hashmap from 'hashmap'

type Dummy = {
    id: string
    a: number,
    b: string,
    c: {
        d: string,
        e: string
    }[]
}

const limit = 50000000
const map = new Hashmap<string, Dummy>();
let selectedId;

for(let i = 0; i < limit; i++){
    let id = uuidv4()
    if(i === Math.trunc(limit/2)){
        selectedId = id
    }
    const dummy:Dummy = {
        id: id,
        a: 2,
        b: 'asdasdqeweqweergerg',
        c: new Array<{
            d: string,
            e: string
        }>(50).fill({
            d: '1231231231231231235644684123123',
            e: 'sfioefoiwejfqwifjwifjwioefjwioefjwioefjwiofjweijfwifjwfjwioefjwiofjwojfweif'
        })
    }
    map.set(id ,dummy);
}
console.log('setup finished')

let state = {
    obj: map
}
setAutoFreeze(true);
let start = Date.now();
produce(state, draft => {
    selectedId = uuidv4();
    draft.obj.set(selectedId,{
        id: selectedId,
        a: 2,
        b: 'ccc',
        c: new Array<{
            d: string,
            e: string
        }>(50).fill({
            d: 'aaa',
            e: 'bbb'
        })
    })
})

// map.forEach(value => mapAsArr.push(value)) 
// console.log(a)
let finish = Date.now();
console.log(finish - start)
console.log(state.obj.get(selectedId));

console.log(state.obj.get(selectedId).c[15].d)
