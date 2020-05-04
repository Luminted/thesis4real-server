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
    let newTable = await createPlayTable(req.body.clientLimit);
    if(newTable === null){
        const {code, message} = errorMapping.tableLimitReached;
        res.status(code).json({
            error: message
        });
        return;
    }else{
        res.status(201).json(newTable);
    }
})


async function createPlayTable(clientLimit: number) {
    const serverState = getServerState();
    const tableLimit = serverState.serverConfig.tableLimit;
    const currentTableCount = serverState.tables.length;
    
    if(currentTableCount < tableLimit) {
        const newTable = createTable(clientLimit);
        addTable(newTable);
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