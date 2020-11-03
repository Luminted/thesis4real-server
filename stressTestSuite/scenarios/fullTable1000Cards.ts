import { EClientType, TScenario } from "../typings";

const url = "http://localhost:8081/table"
const duration = 60000;
const messageRate = 1000/60;


export const fullTable1000Cards: TScenario = {
    numberOfCards: 10,
    clients: [
        {
            url,
            duration,
            messageRate,
            type: EClientType.MOVER,
            startDelay: 0,
        },
        {
            url,
            duration,
            messageRate,
            type: EClientType.MOVER,
            startDelay: 0,
        },
        {
            url,
            duration,
            messageRate,
            type: EClientType.MOVER,
            startDelay: 0,
        },
        // {
        //     url,
        //     duration,
        //     messageRate,
        //     type: EClientType.TO_HAND_ADDER,
        //     startDelay: 0
        // },
        // {
        //     url,
        //     duration,
        //     messageRate,
        //     type: EClientType.TO_HAND_ADDER,
        //     startDelay: 1000
        // },
        {
            url,
            duration,
            messageRate,
            type: EClientType.TO_HAND_ADDER,
            startDelay: 2000
        }
    ]
}