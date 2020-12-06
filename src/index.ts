import express from 'express';
import http from 'http';
import cors from 'cors';
import { Container } from 'typescript-ioc';
import { Socket } from './socket';

// TODO: is express needed?
const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
Container.bindName("httpServer").to(server);

Container.get(Socket);

const port = process.env.PORT || 8083;
server.listen(port, () => {
    console.log(`listening on port ${port}` );
});

