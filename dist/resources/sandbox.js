"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sandbox = void 0;
const client_1 = require("../client");
const file_io_1 = require("./file_io");
class Sandbox {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.template_id = data.template_id;
        this.state = data.state;
        this.ip_address = data.ip_address;
        this.access_url = data.access_url;
        this.created_at = data.created_at;
        this._client = (0, client_1.getDefaultClient)();
    }
    get files() {
        if (!this.id) {
            throw new Error("Sandbox ID is missing.");
        }
        return new file_io_1.FileIO(this._client, this.id);
    }
    static async create(template, name, vcpu = 2, memory = 2048) {
        const client = (0, client_1.getDefaultClient)();
        const payload = {
            template_id: template,
            name: name,
            vcpu_count: vcpu,
            mem_size_mib: memory,
        };
        const data = await client.request("POST", "/sandboxes", payload);
        return new Sandbox(data);
    }
    static async get(id) {
        const client = (0, client_1.getDefaultClient)();
        const data = await client.request("GET", `/sandboxes/${id}`);
        return new Sandbox(data);
    }
    static async list() {
        const client = (0, client_1.getDefaultClient)();
        const data = await client.request("GET", "/sandboxes");
        // Assuming API returns array as per Python SDK comment
        return (Array.isArray(data) ? data : []).map((item) => new Sandbox(item));
    }
    async delete() {
        if (!this.id) {
            throw new Error("Sandbox ID is missing.");
        }
        await this._client.request("DELETE", `/sandboxes/${this.id}`);
        return true;
    }
    async refresh() {
        if (!this.id) {
            throw new Error("Sandbox ID is missing.");
        }
        const data = await this._client.request("GET", `/sandboxes/${this.id}`);
        Object.assign(this, data);
    }
    async _mcpPost(toolName, args) {
        const base = this._client.baseUrl || this._client.base_url || this._client.baseURL;
        if (!base)
            throw new Error("Client base URL unavailable for MCP request");
        const root = String(base).replace(/\/[^\/]+$/, "");
        const url = `${root}/mcp/tools`;
        return await this._client.request("POST", url, { name: toolName, arguments: args });
    }
    // Lifecycle
    async start(useMcp = false) {
        if (!this.id)
            throw new Error("Sandbox ID is missing.");
        if (useMcp) {
            await this._mcpPost("start_sandbox", { sandbox_id: this.id });
            return;
        }
        await this._client.request("POST", `/sandboxes/${this.id}/start`);
    }
    async pause(useMcp = false) {
        if (!this.id)
            throw new Error("Sandbox ID is missing.");
        if (useMcp) {
            await this._mcpPost("pause_sandbox", { sandbox_id: this.id });
            return;
        }
        await this._client.request("POST", `/sandboxes/${this.id}/pause`);
    }
    async terminate(useMcp = false) {
        if (!this.id)
            throw new Error("Sandbox ID is missing.");
        if (useMcp) {
            await this._mcpPost("stop_sandbox", { sandbox_id: this.id });
            return;
        }
        await this._client.request("POST", `/sandboxes/${this.id}/terminate`);
    }
    // SSH token helpers
    async createSshToken(ttlMinutes = 60) {
        return await this._client.request("POST", `/sandboxes/${this.id}/ssh-token`, { ttl_minutes: ttlMinutes });
    }
    async listSshTokens() {
        return await this._client.request("GET", `/sandboxes/${this.id}/ssh-token`);
    }
    async revokeSshToken(token) {
        await this._client.request("DELETE", `/sandboxes/${this.id}/ssh-token`, undefined, { token });
    }
    // Execute
    async execute(code, language = "bash", useMcp = false) {
        if (useMcp) {
            const res = await this._mcpPost("execute_command", { sandbox_id: this.id, command: code });
            const content = (res === null || res === void 0 ? void 0 : res.content) || [];
            return { stdout: content.map((c) => c.text || "").join("\n") };
        }
        return await this._client.request("POST", `/sandboxes/${this.id}/execute`, { code, language });
    }
    // PTY and sessions convenience
    async createPty(command = "/bin/bash", cwd, cols = 80, rows = 24) {
        return await this._client.request("POST", `/sandboxes/${this.id}/pty`, { command, cwd, cols, rows });
    }
    async sendPtyInput(ptyId, data) {
        return await this._client.request("POST", `/sandboxes/${this.id}/pty/${ptyId}/input`, { input: data });
    }
    async resizePty(ptyId, cols, rows) {
        return await this._client.request("POST", `/sandboxes/${this.id}/pty/${ptyId}/resize`, { cols, rows });
    }
    async getPtyLogs(ptyId, offset = 0) {
        return await this._client.request("GET", `/sandboxes/${this.id}/pty/${ptyId}/logs`, undefined, { offset });
    }
    async deletePty(ptyId) {
        return await this._client.request("DELETE", `/sandboxes/${this.id}/pty/${ptyId}`);
    }
    async listSessions() {
        return await this._client.request("GET", `/sandboxes/${this.id}/sessions`);
    }
    async createSession(command, cwd, name) {
        return await this._client.request("POST", `/sandboxes/${this.id}/sessions`, { command, cwd, name });
    }
    async getSessionLogs(sessionId, offset = 0) {
        return await this._client.request("GET", `/sandboxes/${this.id}/sessions/${sessionId}/logs`, undefined, { offset });
    }
    async deleteSession(sessionId) {
        return await this._client.request("DELETE", `/sandboxes/${this.id}/sessions/${sessionId}`);
    }
    // File convenience wrappers
    get filesClient() {
        return new file_io_1.FileIO(this._client, this.id);
    }
    async listFiles(path = ".", recursive = false) {
        return this.files.list(path, { recursive });
    }
    async readFile(path, encoding = "utf-8", useMcp = false) {
        if (useMcp) {
            const res = await this._mcpPost("read_file", { sandbox_id: this.id, path, encoding });
            return ((res === null || res === void 0 ? void 0 : res.content) || []).map((c) => c.text || "").join("\n");
        }
        return this.files.read(path, { encoding });
    }
    async writeFile(path, content, encoding = "utf-8", useMcp = false) {
        if (useMcp) {
            await this._mcpPost("write_file", { sandbox_id: this.id, path, content, encoding });
            return true;
        }
        return this.files.write(path, content, { encoding });
    }
    async createDir(path) {
        return this.files.createDirectory(path);
    }
    async deleteFileOrDir(path, recursive = false) {
        if (recursive)
            return this.files.deleteDirectory(path);
        return this.files.deleteFile(path);
    }
}
exports.Sandbox = Sandbox;
