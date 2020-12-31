import { EClientType, TScenario } from "../typings";

const url = "http://localhost:8083/table"
const duration = 60000;
const messageRate = 1000/15;


export const fullTable1000Cards: TScenario = {
    duration: 60000,
    numberOfCards: 0,
    clients: [
        {
            url,
            duration,
            messageRate,
            type: EClientType.MOVER,
            startDelay: 0,
            seatId: "1"
        },
        {
            url,
            duration,
            messageRate,
            type: EClientType.MOVER,
            startDelay: 0,
            seatId: "2"
        },
        {
            url,
            duration,
            messageRate,
            type: EClientType.TO_HAND_ADDER,
            startDelay: 0,
            seatId: "3"
        },
        {
            url,
            duration,
            messageRate,
            type: EClientType.TO_HAND_ADDER,
            startDelay: 0,
        seatId: "4"
        },
        {
            url,
            duration,
            messageRate,
            type: EClientType.MOVER,
            startDelay: 1000,
        seatId: "5"
        },
        {
            url,
            duration,
            messageRate,
            type: EClientType.MOVER,
            startDelay: 2000,
            seatId: "6"
        }
    ]
}