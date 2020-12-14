import { Container } from "typescript-ioc";
import { Socket } from "./socket";

const socket = Container.get(Socket);

const port = Number.parseInt(process.env.PORT, 10) || 8083;
socket.listen(port);
