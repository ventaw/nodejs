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
        this.internet_enabled = data.internet_enabled;
        this.egress_profile = data.egress_profile;
        this._client = (0, client_1.getDefaultClient)();
    }
    get files() {
        if (!this.id) {
            throw new Error("Sandbox ID is missing.");
        }
        return new file_io_1.FileIO(this._client, this.id);
    }
    static get secrets() {
        return (0, client_1.getDefaultClient)().secrets;
    }
    static async create(template, name, vcpu = 2, memory = 2048, internet_enabled = false, egress_profile = "none") {
        const client = (0, client_1.getDefaultClient)();
        const payload = {
            template_id: template,
            name: name,
            vcpu_count: vcpu,
            mem_size_mib: memory,
            internet_enabled: internet_enabled,
            egress_profile: egress_profile,
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
    async execute(code, language = "bash", optionsOrMcp) {
        if (!this.id)
            throw new Error("Sandbox ID is missing.");
        const useMcp = typeof optionsOrMcp === "boolean" ? optionsOrMcp : false;
        const options = typeof optionsOrMcp === "object" ? optionsOrMcp : undefined;
        if (useMcp) {
            const res = await this._mcpPost("execute_command", { sandbox_id: this.id, command: code });
            const content = (res === null || res === void 0 ? void 0 : res.content) || [];
            return { stdout: content.map((c) => c.text || "").join("\n") };
        }
        return await this._client.request("POST", `/sandboxes/${this.id}/execute`, {
            code,
            language,
            timeout: options === null || options === void 0 ? void 0 : options.timeout
        });
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
    // Metrics and Logs
    async getMetrics(limit = 100) {
        if (!this.id)
            throw new Error("Sandbox ID is missing.");
        return await this._client.request("GET", `/sandboxes/${this.id}/metrics`, undefined, { limit });
    }
    async getMetricsSummary() {
        if (!this.id)
            throw new Error("Sandbox ID is missing.");
        return await this._client.request("GET", `/sandboxes/${this.id}/metrics/summary`);
    }
    async getLogs(limit = 100) {
        if (!this.id)
            throw new Error("Sandbox ID is missing.");
        return await this._client.request("GET", `/sandboxes/${this.id}/logs`, undefined, { limit });
    }
    // Update
    async update(options) {
        if (!this.id)
            throw new Error("Sandbox ID is missing.");
        const payload = {};
        if (options.name !== undefined)
            payload.name = options.name;
        if (options.startupCommand !== undefined)
            payload.startup_command = options.startupCommand;
        if (options.startupCommand !== undefined)
            payload.startup_command = options.startupCommand;
        if (options.internetEnabled !== undefined)
            payload.internet_enabled = options.internetEnabled;
        if (options.egressProfile !== undefined)
            payload.egress_profile = options.egressProfile;
        if (options.vpcId !== undefined)
            payload.vpc_id = options.vpcId;
        if (options.defaultPort !== undefined)
            payload.default_port = options.defaultPort;
        const data = await this._client.request("PATCH", `/sandboxes/${this.id}`, payload);
        Object.assign(this, data);
        return true;
    }
    // Git operations
    async gitClone(repoUrl, targetDir) {
        if (!this.id)
            throw new Error("Sandbox ID is missing.");
        return await this._client.request("POST", `/sandboxes/${this.id}/git/clone`, {
            repo_url: repoUrl,
            target_dir: targetDir
        });
    }
    async gitStatus() {
        if (!this.id)
            throw new Error("Sandbox ID is missing.");
        return await this._client.request("POST", `/sandboxes/${this.id}/git/status`);
    }
    async gitPull() {
        if (!this.id)
            throw new Error("Sandbox ID is missing.");
        return await this._client.request("POST", `/sandboxes/${this.id}/git/pull`);
    }
    // --- Structured Git Operations ---
    async gitDiff(options) {
        var _a, _b;
        if (!this.id)
            throw new Error("Sandbox ID is missing.");
        return await this._client.request("POST", `/sandboxes/${this.id}/git/diff`, {
            path: (_a = options === null || options === void 0 ? void 0 : options.path) !== null && _a !== void 0 ? _a : null,
            staged: (_b = options === null || options === void 0 ? void 0 : options.staged) !== null && _b !== void 0 ? _b : false,
        });
    }
    async gitStatusStructured() {
        if (!this.id)
            throw new Error("Sandbox ID is missing.");
        return await this._client.request("GET", `/sandboxes/${this.id}/git/status/structured`);
    }
    async gitDiffBranches(base, compare, path) {
        if (!this.id)
            throw new Error("Sandbox ID is missing.");
        return await this._client.request("POST", `/sandboxes/${this.id}/git/diff-branches`, {
            base,
            compare: compare !== null && compare !== void 0 ? compare : null,
            path: path !== null && path !== void 0 ? path : null,
        });
    }
    async gitLogStructured(options) {
        if (!this.id)
            throw new Error("Sandbox ID is missing.");
        const params = {};
        if ((options === null || options === void 0 ? void 0 : options.limit) !== undefined)
            params.limit = options.limit;
        if (options === null || options === void 0 ? void 0 : options.branch)
            params.branch = options.branch;
        return await this._client.request("GET", `/sandboxes/${this.id}/git/log/structured`, undefined, params);
    }
    async gitBlame(file, startLine, endLine) {
        if (!this.id)
            throw new Error("Sandbox ID is missing.");
        return await this._client.request("POST", `/sandboxes/${this.id}/git/blame`, {
            file,
            start_line: startLine !== null && startLine !== void 0 ? startLine : null,
            end_line: endLine !== null && endLine !== void 0 ? endLine : null,
        });
    }
    // Advanced file operations
    async grep(pattern, path = "/", recursive = true) {
        if (!this.id)
            throw new Error("Sandbox ID is missing.");
        return await this._client.request("POST", `/sandboxes/${this.id}/files/grep`, {
            pattern,
            path,
            recursive
        });
    }
    async getFileTree(path = "/") {
        if (!this.id)
            throw new Error("Sandbox ID is missing.");
        return await this._client.request("GET", `/sandboxes/${this.id}/files/tree`, undefined, { path });
    }
    // Code Intelligence (CodeRLM)
    async codeStructure() {
        if (!this.id)
            throw new Error("Sandbox ID is missing.");
        return await this._client.request("GET", `/sandboxes/${this.id}/code/structure`);
    }
    async codeSymbols(file) {
        if (!this.id)
            throw new Error("Sandbox ID is missing.");
        return await this._client.request("GET", `/sandboxes/${this.id}/code/symbols`, undefined, { file });
    }
    async codeSymbolSearch(query) {
        if (!this.id)
            throw new Error("Sandbox ID is missing.");
        return await this._client.request("GET", `/sandboxes/${this.id}/code/symbols/search`, undefined, { q: query });
    }
    async codeImplementation(symbol, file) {
        if (!this.id)
            throw new Error("Sandbox ID is missing.");
        return await this._client.request("GET", `/sandboxes/${this.id}/code/symbols/implementation`, undefined, { symbol, file });
    }
    async codeCallers(symbol, file) {
        if (!this.id)
            throw new Error("Sandbox ID is missing.");
        return await this._client.request("GET", `/sandboxes/${this.id}/code/symbols/callers`, undefined, { symbol, file });
    }
    async codePeek(file, startLine, endLine) {
        if (!this.id)
            throw new Error("Sandbox ID is missing.");
        return await this._client.request("GET", `/sandboxes/${this.id}/code/peek`, undefined, { file, start: startLine, end: endLine });
    }
    async codeGrep(pattern, path) {
        if (!this.id)
            throw new Error("Sandbox ID is missing.");
        const params = { pattern };
        if (path)
            params.path = path;
        return await this._client.request("GET", `/sandboxes/${this.id}/code/grep`, undefined, params);
    }
}
exports.Sandbox = Sandbox;
