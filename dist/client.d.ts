import { SecretIO } from "./resources/secret_io";
export interface ClientOptions {
    apiKey?: string;
    baseUrl?: string;
    timeout?: number;
    maxRetries?: number;
}
export declare const config: {
    apiKey: string | undefined;
    apiBase: string;
    timeout: number;
    maxRetries: number;
};
export declare class Client {
    private apiKey;
    private baseUrl;
    private session;
    private maxRetries;
    constructor(options?: ClientOptions);
    get secrets(): SecretIO;
    request<T = any>(method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH", path: string, data?: any, params?: any, options?: any): Promise<T>;
    private handleError;
}
export declare function getDefaultClient(): Client;
