"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = exports.config = void 0;
exports.getDefaultClient = getDefaultClient;
const axios_1 = __importDefault(require("axios"));
const error_1 = require("./error");
// Global configuration storage
exports.config = {
    apiKey: undefined,
    apiBase: "https://ventaw.mmogomedia.com/v1",
    timeout: 30000,
    maxRetries: 3,
};
class Client {
    constructor(options = {}) {
        var _a, _b;
        this.apiKey = options.apiKey || exports.config.apiKey;
        this.baseUrl = (options.baseUrl || exports.config.apiBase).replace(/\/$/, "");
        const timeout = (_a = options.timeout) !== null && _a !== void 0 ? _a : exports.config.timeout;
        this.maxRetries = (_b = options.maxRetries) !== null && _b !== void 0 ? _b : exports.config.maxRetries;
        if (!this.apiKey) {
            throw new error_1.AuthenticationError("No API key provided. Set config.apiKey or pass apiKey to Client constructor.");
        }
        this.session = axios_1.default.create({
            baseURL: this.baseUrl,
            timeout: timeout,
            headers: {
                "X-API-Key": this.apiKey,
                "Content-Type": "application/json",
                "User-Agent": "VentawJsSDK/0.1.0",
            },
        });
        // Add interceptor for error handling
        this.session.interceptors.response.use((response) => response, (error) => this.handleError(error));
    }
    async request(method, path, data, params) {
        let lastError;
        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
            try {
                const response = await this.session.request({
                    method,
                    url: path,
                    data,
                    params,
                });
                return response.data;
            }
            catch (error) {
                lastError = error;
                // Do not retry on AuthenticationError or 4xx errors (except maybe 429)
                if (error instanceof error_1.AuthenticationError || (error instanceof error_1.APIError && error.statusCode && error.statusCode >= 400 && error.statusCode < 500 && error.statusCode !== 429)) {
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
    handleError(error) {
        if (axios_1.default.isAxiosError(error)) {
            if (error.response) {
                const status = error.response.status;
                const data = error.response.data;
                const message = (typeof data === "object" && data !== null && "detail" in data
                    ? data.detail
                    : JSON.stringify(data)) || error.message;
                if (status === 401) {
                    throw new error_1.AuthenticationError(message);
                }
                else {
                    throw new error_1.APIError(message, status);
                }
            }
            else if (error.request) {
                throw new error_1.APIConnectionError(`Connection error: ${error.message}`);
            }
            else {
                throw new error_1.APIConnectionError(`Request setup error: ${error.message}`);
            }
        }
        // If it's already one of our errors (re-thrown), just throw it
        // Assuming VentawError is a base class for APIError, APIConnectionError, AuthenticationError
        // or that it will be defined/imported elsewhere.
        if (error instanceof error_1.APIError || error instanceof error_1.APIConnectionError || error instanceof error_1.AuthenticationError) {
            throw error;
        }
        throw new error_1.APIConnectionError(`Unknown error: ${error}`);
    }
}
exports.Client = Client;
let defaultClient = null;
function getDefaultClient() {
    if (!defaultClient) {
        defaultClient = new Client();
    }
    return defaultClient;
}
