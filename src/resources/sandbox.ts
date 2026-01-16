import { getDefaultClient, Client } from "../client";
import { FileIO } from "./file_io";

export interface SandboxData {
    id: string;
    name?: string;
    template_id?: string;
    state?: string;
    ip_address?: string;
    access_url?: string;
    created_at?: string;
}

export class Sandbox {
    public id: string;
    public name?: string;
    public template_id?: string;
    public state?: string;
    public ip_address?: string;
    public access_url?: string;
    public created_at?: string;
    private _client: Client;

    constructor(data: SandboxData) {
        this.id = data.id;
        this.name = data.name;
        this.template_id = data.template_id;
        this.state = data.state;
        this.ip_address = data.ip_address;
        this.access_url = data.access_url;
        this.created_at = data.created_at;
        this._client = getDefaultClient();
    }

    public get files(): FileIO {
        if (!this.id) {
            throw new Error("Sandbox ID is missing.");
        }
        return new FileIO(this._client, this.id);
    }

    public static async create(
        template: string,
        name: string,
        vcpu: number = 2,
        memory: number = 2048
    ): Promise<Sandbox> {
        const client = getDefaultClient();
        const payload = {
            template_id: template,
            name: name,
            vcpu_count: vcpu,
            mem_size_mib: memory,
        };
        const data = await client.request<SandboxData>("POST", "/sandboxes", payload);
        return new Sandbox(data);
    }

    public static async get(id: string): Promise<Sandbox> {
        const client = getDefaultClient();
        const data = await client.request<SandboxData>("GET", `/sandboxes/${id}`);
        return new Sandbox(data);
    }

    public static async list(): Promise<Sandbox[]> {
        const client = getDefaultClient();
        const data = await client.request<SandboxData[]>("GET", "/sandboxes");
        // Assuming API returns array as per Python SDK comment
        return (Array.isArray(data) ? data : []).map(
            (item) => new Sandbox(item)
        );
    }

    public async delete(): Promise<boolean> {
        if (!this.id) {
            throw new Error("Sandbox ID is missing.");
        }
        await this._client.request("DELETE", `/sandboxes/${this.id}`);
        return true;
    }

    public async refresh(): Promise<void> {
        if (!this.id) {
            throw new Error("Sandbox ID is missing.");
        }
        const data = await this._client.request<SandboxData>("GET", `/sandboxes/${this.id}`);
        Object.assign(this, data);
    }

    private async _mcpPost(toolName: string, args: Record<string, any>): Promise<any> {
        const base = (this._client as any).baseUrl || (this._client as any).base_url || (this._client as any).baseURL;
        if (!base) throw new Error("Client base URL unavailable for MCP request");
        const root = String(base).replace(/\/[^\/]+$/, "");
        const url = `${root}/mcp/tools`;
        return await this._client.request<any>("POST", url, { name: toolName, arguments: args });
    }

    // Lifecycle
    public async start(useMcp: boolean = false): Promise<void> {
        if (!this.id) throw new Error("Sandbox ID is missing.");
        if (useMcp) {
            await this._mcpPost("start_sandbox", { sandbox_id: this.id });
            return;
        }
        await this._client.request("POST", `/sandboxes/${this.id}/start`);
    }

    public async pause(useMcp: boolean = false): Promise<void> {
        if (!this.id) throw new Error("Sandbox ID is missing.");
        if (useMcp) {
            await this._mcpPost("pause_sandbox", { sandbox_id: this.id });
            return;
        }
        await this._client.request("POST", `/sandboxes/${this.id}/pause`);
    }

    public async terminate(useMcp: boolean = false): Promise<void> {
        if (!this.id) throw new Error("Sandbox ID is missing.");
        if (useMcp) {
            await this._mcpPost("stop_sandbox", { sandbox_id: this.id });
            return;
        }
        await this._client.request("POST", `/sandboxes/${this.id}/terminate`);
    }

    // SSH token helpers
    public async createSshToken(ttlMinutes: number = 60): Promise<any> {
        return await this._client.request("POST", `/sandboxes/${this.id}/ssh-token`, { ttl_minutes: ttlMinutes });
    }

    public async listSshTokens(): Promise<any> {
        return await this._client.request("GET", `/sandboxes/${this.id}/ssh-token`);
    }

    public async revokeSshToken(token: string): Promise<void> {
        await this._client.request("DELETE", `/sandboxes/${this.id}/ssh-token`, undefined, { token });
    }

    // Execute
    public async execute(code: string, language: string = "bash", useMcp: boolean = false): Promise<any> {
        if (useMcp) {
            const res = await this._mcpPost("execute_command", { sandbox_id: this.id, command: code });
            const content = res?.content || [];
            return { stdout: content.map((c: any) => c.text || "").join("\n") };
        }
        return await this._client.request("POST", `/sandboxes/${this.id}/execute`, { code, language });
    }

    // PTY and sessions convenience
    public async createPty(command: string = "/bin/bash", cwd?: string, cols: number = 80, rows: number = 24) {
        return await this._client.request("POST", `/sandboxes/${this.id}/pty`, { command, cwd, cols, rows });
    }

    public async sendPtyInput(ptyId: string, data: string) {
        return await this._client.request("POST", `/sandboxes/${this.id}/pty/${ptyId}/input`, { input: data });
    }

    public async resizePty(ptyId: string, cols: number, rows: number) {
        return await this._client.request("POST", `/sandboxes/${this.id}/pty/${ptyId}/resize`, { cols, rows });
    }

    public async getPtyLogs(ptyId: string, offset: number = 0) {
        return await this._client.request("GET", `/sandboxes/${this.id}/pty/${ptyId}/logs`, undefined, { offset });
    }

    public async deletePty(ptyId: string) {
        return await this._client.request("DELETE", `/sandboxes/${this.id}/pty/${ptyId}`);
    }

    public async listSessions() {
        return await this._client.request("GET", `/sandboxes/${this.id}/sessions`);
    }

    public async createSession(command: string, cwd?: string, name?: string) {
        return await this._client.request("POST", `/sandboxes/${this.id}/sessions`, { command, cwd, name });
    }

    public async getSessionLogs(sessionId: string, offset: number = 0) {
        return await this._client.request("GET", `/sandboxes/${this.id}/sessions/${sessionId}/logs`, undefined, { offset });
    }

    public async deleteSession(sessionId: string) {
        return await this._client.request("DELETE", `/sandboxes/${this.id}/sessions/${sessionId}`);
    }

    // File convenience wrappers
    public get filesClient(): FileIO {
        return new FileIO(this._client, this.id);
    }

    public async listFiles(path: string = ".", recursive: boolean = false) {
        return this.files.list(path, { recursive });
    }

    public async readFile(path: string, encoding: "utf-8" | "base64" = "utf-8", useMcp: boolean = false) {
        if (useMcp) {
            const res = await this._mcpPost("read_file", { sandbox_id: this.id, path, encoding });
            return (res?.content || []).map((c: any) => c.text || "").join("\n");
        }
        return this.files.read(path, { encoding });
    }

    public async writeFile(path: string, content: string, encoding: "utf-8" | "base64" = "utf-8", useMcp: boolean = false) {
        if (useMcp) {
            await this._mcpPost("write_file", { sandbox_id: this.id, path, content, encoding });
            return true;
        }
        return this.files.write(path, content, { encoding });
    }

    public async createDir(path: string) {
        return this.files.createDirectory(path);
    }

    public async deleteFileOrDir(path: string, recursive: boolean = false) {
        if (recursive) return this.files.deleteDirectory(path);
        return this.files.deleteFile(path);
    }

    // Metrics and Logs
    public async getMetrics(limit: number = 100): Promise<any[]> {
        if (!this.id) throw new Error("Sandbox ID is missing.");
        return await this._client.request("GET", `/sandboxes/${this.id}/metrics`, undefined, { limit });
    }

    public async getMetricsSummary(): Promise<any> {
        if (!this.id) throw new Error("Sandbox ID is missing.");
        return await this._client.request("GET", `/sandboxes/${this.id}/metrics/summary`);
    }

    public async getLogs(limit: number = 100): Promise<any[]> {
        if (!this.id) throw new Error("Sandbox ID is missing.");
        return await this._client.request("GET", `/sandboxes/${this.id}/logs`, undefined, { limit });
    }

    // Update
    public async update(options: {
        name?: string;
        startupCommand?: string;
        internetEnabled?: boolean;
        vpcId?: string;
        defaultPort?: number;
    }): Promise<boolean> {
        if (!this.id) throw new Error("Sandbox ID is missing.");
        const payload: any = {};
        if (options.name !== undefined) payload.name = options.name;
        if (options.startupCommand !== undefined) payload.startup_command = options.startupCommand;
        if (options.internetEnabled !== undefined) payload.internet_enabled = options.internetEnabled;
        if (options.vpcId !== undefined) payload.vpc_id = options.vpcId;
        if (options.defaultPort !== undefined) payload.default_port = options.defaultPort;

        const data = await this._client.request("PATCH", `/sandboxes/${this.id}`, payload);
        Object.assign(this, data);
        return true;
    }

    // Git operations
    public async gitClone(repoUrl: string, targetDir: string): Promise<any> {
        if (!this.id) throw new Error("Sandbox ID is missing.");
        return await this._client.request("POST", `/sandboxes/${this.id}/git/clone`, {
            repo_url: repoUrl,
            target_dir: targetDir
        });
    }

    public async gitStatus(): Promise<any> {
        if (!this.id) throw new Error("Sandbox ID is missing.");
        return await this._client.request("POST", `/sandboxes/${this.id}/git/status`);
    }

    public async gitPull(): Promise<any> {
        if (!this.id) throw new Error("Sandbox ID is missing.");
        return await this._client.request("POST", `/sandboxes/${this.id}/git/pull`);
    }

    // Advanced file operations
    public async grep(pattern: string, path: string = "/", recursive: boolean = true): Promise<any> {
        if (!this.id) throw new Error("Sandbox ID is missing.");
        return await this._client.request("POST", `/sandboxes/${this.id}/files/grep`, {
            pattern,
            path,
            recursive
        });
    }

    public async getFileTree(path: string = "/"): Promise<any> {
        if (!this.id) throw new Error("Sandbox ID is missing.");
        return await this._client.request("GET", `/sandboxes/${this.id}/files/tree`, undefined, { path });
    }
}
