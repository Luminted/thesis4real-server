import {Router} from 'express';
import {errorMapping} from './errorMapping';
import {createTable} from '../../socket-modules/table/createTable';
import {addTable, getServerState} from '../../state';

const tableRouter = Router();
const routeBase = '/table'

tableRouter.post(routeBase + '/create', async function (req, res) {
    // TODO: validate validation param
    if(req.body.validation){
        if(!req.body.clientLimit){
            const {code, message} = errorMapping.undefinedMaxTableSize;
            res.status(code).json({
                error: message
            });
            return;
        }
    }
    const tableWidth: number = req.body.tableWidth;
    const tableHeight: number = req.body.tableHeight;
    let newTable = await createPlayTable(tableWidth, tableHeight);
    if(newTable === null){
        const {code, message} = errorMapping.tableLimitReached;
        res.status(code).json({
            error: message
        });
        return;
    }else{
        addTable(...newTable);
        res.status(201).json({
            tableId: newTable[0].tableId
        });
    }
})


async function createPlayTable(tableWidth: number, tableHeight: number) {
    const serverState = getServerState();
    const tableLimit = serverState.serverConfig.tableLimit;
    const currentTableCount = serverState.tables.size;
    
    if(currentTableCount < tableLimit) {
        const newTable = createTable(tableWidth, tableHeight);
        return newTable;
    }
    else{
        return null;
    }
}

export {
    tableRouter,
    routeBase
}