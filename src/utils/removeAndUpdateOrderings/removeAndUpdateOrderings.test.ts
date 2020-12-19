import assert from "assert";
import { removeAndUpdateOrderings } from "./removeAndUpdateOrderings";

describe("removeAndUpdateOrderings", () => {
    describe("cases: ", () => {
        it("ordered ,removing single", () => {
            const ordering = [0,1,2];
            const indexesToRemove = [1];
    
            const newOrdering = removeAndUpdateOrderings(ordering, indexesToRemove);
    
            const expectedOrdering = [0,1];
            assert.deepEqual(newOrdering, expectedOrdering);
        });
        it("oredered, removing multiple", () => {
            const ordering = [0,1,2,3,4];
            const indexesToRemove = [1,3];
    
            const newOrdering = removeAndUpdateOrderings(ordering, indexesToRemove);
    
            const expectedOrdering = [0,1,2];
            assert.deepEqual(newOrdering, expectedOrdering);
        })
        it("unordered, removing single", () => {
            const ordering = [2,0,1];
            const indexesToRemove = [1];
    
            const newOrdering = removeAndUpdateOrderings(ordering, indexesToRemove);
    
            const expectedOrdering = [1,0];
            assert.deepEqual(newOrdering, expectedOrdering);
        })
        it("unordered, removing multiple", () => {
            const ordering = [4,2,0,1,3];
            const indexesToRemove = [1,3];
    
            const newOrdering = removeAndUpdateOrderings(ordering, indexesToRemove);
    
            const expectedOrdering = [2,0,1];
            assert.deepEqual(newOrdering, expectedOrdering);
        })
    })
})