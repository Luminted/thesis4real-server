export interface ITestClientConfig {
    duration: number
    startDelay: number
    messageRate: number
    url: string
    seatId: string
}

export interface IClientConfig extends ITestClientConfig {
    type: EClientType
}

export enum EClientType {
    MOVER,
    TO_HAND_ADDER
}

export type TScenario = {
    duration: number
    numberOfCards: number,
    clients: IClientConfig[]
}