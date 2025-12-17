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
    request<T = any>(method: "GET" | "POST" | "PUT" | "DELETE", path: string, data?: any, params?: any): Promise<T>;
    private handleError;
}
export declare function getDefaultClient(): Client;
