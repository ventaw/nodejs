import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import { APIError, APIConnectionError, AuthenticationError } from "./error";

export interface ClientOptions {
    apiKey?: string;
    baseUrl?: string;
    timeout?: number;
    maxRetries?: number;
}

// Global configuration storage
export const config = {
    apiKey: undefined as string | undefined,
    apiBase: "https://api.ventaw.com/v1",
    timeout: 30000,
    maxRetries: 3,
};

export class Client {
    private apiKey: string | undefined;
    private baseUrl: string;
    private session: AxiosInstance;
    private maxRetries: number;

    constructor(options: ClientOptions = {}) {
        this.apiKey = options.apiKey || config.apiKey;
        this.baseUrl = (options.baseUrl || config.apiBase).replace(/\/$/, "");
        const timeout = options.timeout ?? config.timeout;
        this.maxRetries = options.maxRetries ?? config.maxRetries;

        if (!this.apiKey) {
            throw new AuthenticationError(
                "No API key provided. Set config.apiKey or pass apiKey to Client constructor."
            );
        }

        this.session = axios.create({
            baseURL: this.baseUrl,
            timeout: timeout,
            headers: {
                "Authorization": `Bearer ${this.apiKey}`,
                "Content-Type": "application/json",
                "User-Agent": "VentawJsSDK/0.1.2",
            },
        });

        // Add interceptor for error handling
        this.session.interceptors.response.use(
            (response) => response,
            (error) => this.handleError(error)
        );
    }

    public async request<T = any>(
        method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
        path: string,
        data?: any,
        params?: any,
        options?: any
    ): Promise<T> {
        let lastError: any;
        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
            try {
                const response: AxiosResponse<T> = await this.session.request({
                    method,
                    url: path,
                    data,
                    params,
                    ...options,
                });
                return response.data;
            } catch (error) {
                lastError = error;
                // Do not retry on AuthenticationError or 4xx errors (except maybe 429)
                if (error instanceof AuthenticationError || (error instanceof APIError && error.statusCode && error.statusCode >= 400 && error.statusCode < 500 && error.statusCode !== 429)) {
                    throw error;
                }

                // If it's the last attempt, throw
                if (attempt === this.maxRetries) {
                    throw error;
                }

                // Wait before retrying (exponential backoff: 500ms, 1000ms, 2000ms...)
                const delay = 500 * Math.pow(2, attempt);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
        throw lastError;
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
        // If it's already one of our errors (re-thrown), just throw it
        // Assuming VentawError is a base class for APIError, APIConnectionError, AuthenticationError
        // or that it will be defined/imported elsewhere.
        if (error instanceof APIError || error instanceof APIConnectionError || error instanceof AuthenticationError) {
            throw error;
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
