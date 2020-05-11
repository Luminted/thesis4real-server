import assert from 'assert';
import { cardFactory } from "../../../factories"
import { CardTypes, Entity, EntityTypes } from "../../../types/dataModelDefinitions"
import { resetZIndexes } from "./utils"
import { enableMapSet } from 'immer';

describe('Testing utility functions', function(){
    //Enable Map support for Immer
    enableMapSet();

    describe('ResetZIndexes', function(){
        it('should reduce z-index of given entities by (zIndexLimit - numberOfEntities + 1).', function(){
            const originalEntities = new Map<string, Entity>();
            const numberOfEntities = 15;
            const zIndexLimit = 100;
            for(let i = 0; i < numberOfEntities; i++){
                const newEntity = cardFactory(0,0,CardTypes.FRENCH, undefined, undefined, `${i}`, undefined, undefined, undefined, zIndexLimit - i);
                originalEntities.set(newEntity.entityId, newEntity);
            }
            let resetEntities = resetZIndexes(originalEntities, numberOfEntities, zIndexLimit);
            for(let i = 0; i < numberOfEntities; i++){
                assert.equal(resetEntities.get(`${i}`).zIndex, originalEntities.get(`${i}`).zIndex - (zIndexLimit - numberOfEntities) - 1);
            }
        })

        it('should be a clean function', function(){
            const numberOfEntities = 15;
            const zIndexLimit = 100;
            const entityId = 'mock'
            const originalEntities = new Map<string, Entity>();
            originalEntities.set(entityId, {
                entityId,
                entityType: EntityTypes.CARD,
                grabbedBy: null,
                height: 0,
                width: 0,
                positionX: 0,
                positionY: 0,
                scale: 0,
                zIndex: zIndexLimit
            });
            const resetEntities = resetZIndexes(originalEntities, numberOfEntities, zIndexLimit);
            assert.notDeepEqual(originalEntities.get(entityId), resetEntities.get(entityId));
        })
    })
})