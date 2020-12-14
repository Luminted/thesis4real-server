import { TGameState } from "../../typings";

// WARNING: This function has side effects. Use it only with Immer draft!
export const calcNextZIndex = (gameStateDraft: TGameState, zIndexLimit: number) => {
  const { cards, decks } = gameStateDraft;
  const nextZIndex = gameStateDraft.topZIndex + 1;
  gameStateDraft.topZIndex += 1;
  if (nextZIndex > zIndexLimit) {
    const absoluteNumberOfEntities = cards.size + decks.size;
    // resetting cards
    for (const [_, entity] of gameStateDraft.cards) {
      entity.zIndex = entity.zIndex - zIndexLimit + absoluteNumberOfEntities - 1;
    }

    // resetting decks
    for (const [_, entity] of gameStateDraft.decks) {
      entity.zIndex = entity.zIndex - zIndexLimit + absoluteNumberOfEntities - 1;
    }

    gameStateDraft.topZIndex = absoluteNumberOfEntities;
    return absoluteNumberOfEntities;
  }

  return nextZIndex;
};
