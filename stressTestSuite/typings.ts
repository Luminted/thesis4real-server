export interface ITestClientConfig {
    duration: number
    startDelay: number
    messageRate: number
    url: string
}

export interface IClientConfig extends ITestClientConfig {
    type: EClientType
}

export enum EClientType {
    MOVER,
    TO_HAND_ADDER
}

export type TMessageTimestamp = {
    id: number,
    timestamp: number
}

export type TScenario = {
    numberOfCards: number,
    clients: IClientConfig[]
}