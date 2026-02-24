import { Client } from "../client";
export interface Secret {
    id: string;
    name: string;
    description?: string;
    created_at: string;
}
export declare class SecretIO {
    private _client;
    constructor(client: Client);
    list(): Promise<Secret[]>;
    set(name: string, value: string, description?: string): Promise<Secret>;
    get(name: string): Promise<string>;
    delete(name: string): Promise<boolean>;
}
