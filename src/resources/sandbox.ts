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
        const data = await client.request("POST", "/sandboxes", payload);
        return new Sandbox(data);
    }

    public static async get(id: string): Promise<Sandbox> {
        const client = getDefaultClient();
        const data = await client.request("GET", `/sandboxes/${id}`);
        return new Sandbox(data);
    }

    public static async list(): Promise<Sandbox[]> {
        const client = getDefaultClient();
        const data = await client.request("GET", "/sandboxes");
        // Assuming API returns array as per Python SDK comment
        return (Array.isArray(data) ? data : []).map(
            (item: any) => new Sandbox(item)
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
        const data = await this._client.request("GET", `/sandboxes/${this.id}`);
        Object.assign(this, data);
    }
}
