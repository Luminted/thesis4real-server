import { Entity, EntityTypes } from "../types/dataModelDefinitions";

export const cardEntityMock: Entity = {
    entityId: 'entity-id',
    entityType: EntityTypes.CARD,
    grabbedBy: null,
    height: 10,
    width: 11,
    positionX: 0,
    positionY: 1,
    scale: 1,
    zIndex: 0
}