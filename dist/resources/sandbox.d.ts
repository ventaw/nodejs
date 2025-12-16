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
export declare class Sandbox {
    id: string;
    name?: string;
    template_id?: string;
    state?: string;
    ip_address?: string;
    access_url?: string;
    created_at?: string;
    private _client;
    constructor(data: SandboxData);
    get files(): FileIO;
    static create(template: string, name: string, vcpu?: number, memory?: number): Promise<Sandbox>;
    static get(id: string): Promise<Sandbox>;
    static list(): Promise<Sandbox[]>;
    delete(): Promise<boolean>;
    refresh(): Promise<void>;
}
