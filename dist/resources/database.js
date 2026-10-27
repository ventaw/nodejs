"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const client_1 = require("../client");
const base_1 = require("./base");
/** A PostgreSQL or Valkey database. Your other sandboxes connect with `connectionString`. */
class Database extends base_1.Resource {
    constructor(data) {
        super(data);
        this.assign(data);
    }
    assign(data) {
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
    static getEndpoint() {
        return "/databases";
    }
    /** engine defaults to "postgres". Sizes left out use the engine's default (or the plan's). */
    static async create(options) {
        const payload = { name: options.name, engine: options.engine || "postgres", plan: options.plan || "hourly" };
        if (options.vcpu)
            payload.vcpu_count = options.vcpu;
        if (options.memory)
            payload.mem_size_mib = options.memory;
        if (options.disk)
            payload.disk_size_mib = options.disk;
        return new Database(await (0, client_1.getDefaultClient)().request("POST", "/databases", payload));
    }
    async refresh() {
        this.assign(await this._client.request("GET", `/databases/${this.id}`));
    }
    /** Resolve once the database accepts connections (state "running"). */
    async waitUntilReady(timeoutMs = 180000) {
        const deadline = Date.now() + timeoutMs;
        for (;;) {
            await this.refresh();
            if (this.state === "running")
                return this;
            if (this.state === "error" || Date.now() > deadline) {
                throw new Error(`Database ${this.id} is ${this.state}, not running`);
            }
            await new Promise((r) => setTimeout(r, 2000));
        }
    }
    /** Run SQL on a Postgres database and return psql's output. Throws on a SQL error. */
    async query(sql) {
        const res = await this._client.request("POST", `/databases/${this.id}/query`, { sql });
        if (!res.ok)
            throw new Error(res.output);
        return res.output;
    }
}
exports.Database = Database;
