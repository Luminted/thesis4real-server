export const removeAndUpdateOrderings = (ordering: number[], indexesToRemove: number[]) => {
    let ordersToRemove = ordering.filter((_, index) => indexesToRemove.includes(index));
    let updatedOrdering = ordering;
    for(let i = 0; i < ordersToRemove.length; i++){
        const currentOrderToRemove = ordersToRemove[i];
        updatedOrdering = updatedOrdering.reduce((acc, curr) => {
            if(curr === currentOrderToRemove){
                return acc;
            }
            else if(curr > currentOrderToRemove){
                return [...acc, curr - 1];
            }
            else{
                return [...acc, curr];
            }
        }, []);


        ordersToRemove = ordersToRemove.reduce((acc, curr) => {
            if(curr > currentOrderToRemove) {
                return [...acc, curr -1];
            }
            else{
                return [...acc, curr];
            }
        }, []);

    }
    return updatedOrdering;
}