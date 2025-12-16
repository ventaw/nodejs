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
    apiBase: "http://localhost:8000/v1",
};
class Client {
    constructor(options = {}) {
        this.apiKey = options.apiKey || exports.config.apiKey;
        this.baseUrl = (options.baseUrl || exports.config.apiBase).replace(/\/$/, "");
        if (!this.apiKey) {
            throw new error_1.AuthenticationError("No API key provided. Set config.apiKey or pass apiKey to Client constructor.");
        }
        this.session = axios_1.default.create({
            baseURL: this.baseUrl,
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
            // Error is already handled by interceptor, but re-throw just in case
            throw error;
        }
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
