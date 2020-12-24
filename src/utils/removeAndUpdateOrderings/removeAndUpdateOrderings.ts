export const removeAndUpdateOrderings = (ordering: number[], indexesToRemove: number[]) => {
  let ordersToRemove = ordering.filter((_, index) => indexesToRemove.includes(index));
  let updatedOrdering = ordering;
  ordersToRemove.forEach((_, index) => {
    const orderToRemove = ordersToRemove[index];
    updatedOrdering = updatedOrdering.reduce((acc, curr) => {
      if (curr === orderToRemove) {
        return acc;
      }
      if (curr > orderToRemove) {
        return [...acc, curr - 1];
      }
      return [...acc, curr];
    }, []);

    ordersToRemove = ordersToRemove.reduce((acc, curr) => {
      if (curr > orderToRemove) {
        return [...acc, curr - 1];
      }

      return [...acc, curr];
    }, []);
  });
  return updatedOrdering;
};
