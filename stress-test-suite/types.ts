export type AgentConfig = {
    tableId: string
    cardId: string,
    frequency: number, //ms
    port: number,
    host: string
    duration: number //ms
}

export type TestConfig = {
    numberOfAgents: number,
    numberOfCards: number,
}