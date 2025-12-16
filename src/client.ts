import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import { APIError, APIConnectionError, AuthenticationError } from "./error";

export interface ClientOptions {
    apiKey?: string;
    baseUrl?: string;
}

// Global configuration storage
export const config = {
    apiKey: undefined as string | undefined,
    apiBase: "https://ventaw.mmogomedia.com/v1",
};

export class Client {
    private apiKey: string | undefined;
    private baseUrl: string;
    private session: AxiosInstance;

    constructor(options: ClientOptions = {}) {
        this.apiKey = options.apiKey || config.apiKey;
        this.baseUrl = (options.baseUrl || config.apiBase).replace(/\/$/, "");

        if (!this.apiKey) {
            throw new AuthenticationError(
                "No API key provided. Set config.apiKey or pass apiKey to Client constructor."
            );
        }

        this.session = axios.create({
            baseURL: this.baseUrl,
            headers: {
                "X-API-Key": this.apiKey,
                "Content-Type": "application/json",
                "User-Agent": "VentawJsSDK/0.1.0",
            },
        });

        // Add interceptor for error handling
        this.session.interceptors.response.use(
            (response) => response,
            (error) => this.handleError(error)
        );
    }

    public async request<T = any>(
        method: "GET" | "POST" | "PUT" | "DELETE",
        path: string,
        data?: any,
        params?: any
    ): Promise<T> {
        try {
            const response: AxiosResponse<T> = await this.session.request({
                method,
                url: path,
                data,
                params,
            });
            return response.data;
        } catch (error) {
            // Error is already handled by interceptor, but re-throw just in case
            throw error;
        }
    }

    private handleError(error: any): never {
        if (axios.isAxiosError(error)) {
            if (error.response) {
                const status = error.response.status;
                const data = error.response.data;
                const message =
                    (typeof data === "object" && data !== null && "detail" in data
                        ? (data as any).detail
                        : JSON.stringify(data)) || error.message;

                if (status === 401) {
                    throw new AuthenticationError(message);
                } else {
                    throw new APIError(message, status);
                }
            } else if (error.request) {
                throw new APIConnectionError(`Connection error: ${error.message}`);
            } else {
                throw new APIConnectionError(`Request setup error: ${error.message}`);
            }
        }
        throw new APIConnectionError(`Unknown error: ${error}`);
    }
}

let defaultClient: Client | null = null;

export function getDefaultClient(): Client {
    if (!defaultClient) {
        defaultClient = new Client();
    }
    return defaultClient;
}
