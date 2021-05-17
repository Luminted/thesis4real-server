import { EClientType, TScenario } from "../typings";

export const config = {
    duration : 360000,
    messageRate : 1000/60
}

export const HalfMoversHalfAdders: TScenario = {
    duration: config.duration,
    numberOfCards: 0,
    clients: [
        {
            duration: config.duration,
            messageRate: config.messageRate,
            type: EClientType.MOVER,
            startDelay: 0,
            seatId: "1",
            isProbe: true
        },
        {
            duration: config.duration,
            messageRate: config.messageRate,
            type: EClientType.TO_HAND_ADDER,
            startDelay: 30000,
            seatId: "2"
        },
        {
            duration: config.duration,
            messageRate: config.messageRate,
            type: EClientType.MOVER,
            startDelay: 60000,
            seatId: "3"
        },
        {
            duration: config.duration,
            messageRate: config.messageRate,
            type: EClientType.TO_HAND_ADDER,
            startDelay: 90000,
        seatId: "4"
        },
        {
            duration: config.duration,
            messageRate: config.messageRate,
            type: EClientType.MOVER,
            startDelay: 120000,
        seatId: "5"
        },
        {
            duration : config.duration,
            messageRate: config.messageRate,
            type: EClientType.TO_HAND_ADDER,
            startDelay: 150000,
            seatId: "6"
        }
    ]
}