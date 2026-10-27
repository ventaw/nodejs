import { getDefaultClient } from "../client";
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
export class Database extends Resource {
    public name!: string;
    public engine!: "postgres" | "valkey";
    public state!: string;
    public plan!: string;
    public host!: string;
    public port!: number;
    public username!: string;
    public password!: string;
    public database?: string | null;
    public connectionString!: string;
    public createdAt!: string;

    constructor(data: DatabaseData) {
        super(data);
        this.assign(data);
    }

    private assign(data: DatabaseData) {
        this.name = data.name;
        this.engine = data.engine;
        this.state = data.state;
        this.plan = data.plan;
        this.host = data.host;
        this.port = data.port;
        this.username = data.username;
        this.password = data.password;
        this.database = data.database;
        this.connectionString = data.connection_string;
        this.createdAt = data.created_at;
    }

    protected static getEndpoint(): string {
        return "/databases";
    }

    /** engine defaults to "postgres". Sizes left out use the engine's default (or the plan's). */
    public static async create(options: {
        name: string;
        engine?: "postgres" | "valkey";
        plan?: "hourly" | "always_on";
        vcpu?: number;
        memory?: number;
        disk?: number;
    }): Promise<Database> {
        const payload: any = { name: options.name, engine: options.engine || "postgres", plan: options.plan || "hourly" };
        if (options.vcpu) payload.vcpu_count = options.vcpu;
        if (options.memory) payload.mem_size_mib = options.memory;
        if (options.disk) payload.disk_size_mib = options.disk;
        return new Database(await getDefaultClient().request<DatabaseData>("POST", "/databases", payload));
    }

    public async refresh(): Promise<void> {
        this.assign(await this._client.request<DatabaseData>("GET", `/databases/${this.id}`));
    }

    /** Resolve once the database accepts connections (state "running"). */
    public async waitUntilReady(timeoutMs = 180_000): Promise<Database> {
        const deadline = Date.now() + timeoutMs;
        for (;;) {
            await this.refresh();
            if (this.state === "running") return this;
            if (this.state === "error" || Date.now() > deadline) {
                throw new Error(`Database ${this.id} is ${this.state}, not running`);
            }
            await new Promise((r) => setTimeout(r, 2000));
        }
    }

    /** Run SQL on a Postgres database and return psql's output. Throws on a SQL error. */
    public async query(sql: string): Promise<string> {
        const res = await this._client.request<QueryResult>("POST", `/databases/${this.id}/query`, { sql });
        if (!res.ok) throw new Error(res.output);
        return res.output;
    }
}
