export interface QueryOptions {
    timeout?: number;
    retries?: number;
    logQuery?: boolean;
}

export interface QueryResult<T = unknown> {
    data: T[];
    rowsAffected?: number;
    insertId?: number;
}

export class DatabaseError extends Error {
    constructor(
        message: string, 
        public query: string, 
        public values?: unknown[], 
        public originalError?: Error
    ) {
        super(message);
        this.name = "DatabaseError";
    }
}
