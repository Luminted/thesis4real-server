export interface ITestClientConfig {
    duration: number
    startDelay: number
    messageRate: number
    seatId: string
    isProbe?: boolean
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

export interface IEntityMetadata {
    name: string;
    type: string;
  }
  
  export interface ICardEntityMetadata extends IEntityMetadata {
    back: string;
  }