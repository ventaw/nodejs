import { Resource } from "./base";
export interface DatabaseData {
    id: string;
    name: string;
    engine: "postgres" | "valkey";
    state: string;
    plan: string;
    host: string;
    port: number;
    username: string;
    password: string;
    database?: string | null;
    connection_string: string;
    created_at: string;
}
export interface QueryResult {
    ok: boolean;
    output: string;
    truncated: boolean;
}
/** A PostgreSQL or Valkey database. Your other sandboxes connect with `connectionString`. */
export declare class Database extends Resource {
    name: string;
    engine: "postgres" | "valkey";
    state: string;
    plan: string;
    host: string;
    port: number;
    username: string;
    password: string;
    database?: string | null;
    connectionString: string;
    createdAt: string;
    constructor(data: DatabaseData);
    private assign;
    protected static getEndpoint(): string;
    /** engine defaults to "postgres". Sizes left out use the engine's default (or the plan's). */
    static create(options: {
        name: string;
        engine?: "postgres" | "valkey";
        plan?: "hourly" | "always_on";
        vcpu?: number;
        memory?: number;
        disk?: number;
    }): Promise<Database>;
    refresh(): Promise<void>;
    /** Resolve once the database accepts connections (state "running"). */
    waitUntilReady(timeoutMs?: number): Promise<Database>;
    /** Run SQL on a Postgres database and return psql's output. Throws on a SQL error. */
    query(sql: string): Promise<string>;
}
