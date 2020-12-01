import express from 'express';
import http from 'http';
import cors from 'cors';
import { Container } from 'typescript-ioc';
import { Socket } from './socket';

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
Container.bindName("httpServer").to(server);

Container.get(Socket);

const node_env = process.env.NODE_ENV;

const port = process.env.PORT || 8081;
server.listen(port, () => {
    console.log(`running in ${node_env} mode`);
    console.log(`listening on port ${port}` );
});

