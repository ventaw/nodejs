import { Client } from "../client";

export interface Secret {
    id: string;
    name: string;
    description?: string;
    created_at: string;
}

export class SecretIO {
    private _client: Client;

    constructor(client: Client) {
        this._client = client;
    }

    public async list(): Promise<Secret[]> {
        return await this._client.request("GET", "/secrets/");
    }

    public async set(name: string, value: string, description?: string): Promise<Secret> {
        return await this._client.request("POST", "/secrets/", {
            name,
            value,
            description
        });
    }

    public async get(name: string): Promise<string> {
        const res = await this._client.request("GET", `/secrets/${name}`);
        return res.value;
    }

    public async delete(name: string): Promise<boolean> {
        await this._client.request("DELETE", `/secrets/${name}`);
        return true;
    }
}
