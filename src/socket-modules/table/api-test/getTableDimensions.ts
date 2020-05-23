import assert from 'assert';
import SocketIO from 'socket.io';
import SocketIOClient from 'socket.io-client';
import { TableModuleClientEvents, TableModuleServerEvents } from "../../../types/socketTypes";
import { TableModule } from '../tableModule';
import { GameState, CardTable } from '../../../types/dataModelDefinitions';
import { initServerState, addTable } from '../../../state';
import { createTable } from '../createTable';

describe(`Testing Event: ${TableModuleClientEvents.GET_TABLE_DIMENSIONS}`, function(){

    const url = 'http://localhost';
    const port = 4002;
    const socketServer = SocketIO.listen(port);
    const namespace = '/table';
    const tableWidth = 1000;
    const tableHeight = 800;
    let clientSocket: SocketIOClient.Socket;
    let playTable: CardTable;
    
    TableModule(socketServer);
    
    beforeEach((done)=> {

        initServerState();
        let gameState;
        [playTable, gameState] = createTable(tableWidth,tableHeight);
        addTable(playTable, gameState);
        clientSocket = SocketIOClient(`${url}:${port}${namespace}`, {
            forceNew: true,
            autoConnect: false,
            reconnection: false,
            query: {
                tableId: playTable.tableId
            }
        });
        clientSocket.on('connect', () => {
            done();
        })
        clientSocket.connect();
    })

    afterEach((done) => {
        clientSocket.disconnect();
        setTimeout(done, 100)
    })

    this.afterAll(() => {
        socketServer.close()
    })


    it(`should acknowledge with  tables dimensions` , function(done) {
        clientSocket.emit(TableModuleClientEvents.GET_TABLE_DIMENSIONS, (receivedTableWidth: number, receivedTableHeight: number) => {
            assert.equal(receivedTableWidth, tableWidth);
            assert.equal(receivedTableHeight, tableHeight);
            done();
        })
    })
})