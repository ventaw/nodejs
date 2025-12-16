export interface ClientOptions {
    apiKey?: string;
    baseUrl?: string;
}
export declare const config: {
    apiKey: string | undefined;
    apiBase: string;
};
export declare class Client {
    private apiKey;
    private baseUrl;
    private session;
    constructor(options?: ClientOptions);
    request<T = any>(method: "GET" | "POST" | "PUT" | "DELETE", path: string, data?: any, params?: any): Promise<T>;
    private handleError;
}
export declare function getDefaultClient(): Client;
