export const errorMapping = {
    undefinedMaxTableSize: {
        code: 400,
        message: 'Invalid request: maxTableSize undefined'
    },
    tableLimitReached: {
        code: 403,
        message: 'Maximum number of tables reached. Try later, or join one.'
    }
}