import assert from 'assert';
import request from 'supertest'
import {server} from '../../server';
import { errorMapping } from './errorMapping';
import {initServerState, getServerState} from '../../state';

describe('Testing route: /table', function(){
    this.afterEach(() => {
        server.close();
    });

    this.beforeEach(() => {
        initServerState();
    });

    this.afterAll(()=>{
        server.close();
    })

    describe('POST/create', function(){
        it('exists', function(done){
            request(server)
            .post('/table/create')
            .send({
                validation: false
            })
            .expect(res => {
                assert.notEqual(res.status, 404);
            })
            .end(done);
        })
        it('should create a new room', function(done){
            request(server)
            .post('/table/create')
            .send({
                validation: true,
                clientLimit: 1,
            })
            .expect(res => {
                const createdTable = getServerState().tables[0];
                assert.equal(res.body.tableId, createdTable.tableId);
            })
            .end(done);
        })
        it('should respond with proper error message and status code to undefined maxRoomSize', function(done){
            const payload = {
                validation: true,
                maxTableSize: undefined
            }
            request(server)
            .post('/table/create')
            .send({
                validation: true
            })
            .end((err, res) => {
                if(err) {
                    done(err);
                }else {
                    const {code, message} = errorMapping.undefinedMaxTableSize;
                    assert.equal(res.status, code);
                    assert.equal(res.body.error, message);
                    done();
                }
            })
        })
        it('should respond with proper error message and status code when reaching table limit', function(done){
            initServerState({
                tableLimit: 0
            });
            request(server)
            .post('/table/create')
            .send({
                validation: false,
            })
            .end((err, res) => {
                if(err){
                    done(err);
                }else {
                    const {code, message} = errorMapping.tableLimitReached;
                    assert.equal(res.status, code);
                    assert.equal(res.body.error, message);
                    done();
                }
            })
        })
    })
})