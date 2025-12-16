"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIConnectionError = exports.AuthenticationError = exports.APIError = exports.VentawError = void 0;
class VentawError extends Error {
    constructor(message) {
        super(message);
        this.name = "VentawError";
    }
}
exports.VentawError = VentawError;
class APIError extends VentawError {
    constructor(message, statusCode) {
        super(message);
        this.name = "APIError";
        this.statusCode = statusCode;
    }
}
exports.APIError = APIError;
class AuthenticationError extends APIError {
    constructor(message) {
        super(message, 401);
        this.name = "AuthenticationError";
    }
}
exports.AuthenticationError = AuthenticationError;
class APIConnectionError extends VentawError {
    constructor(message) {
        super(message);
        this.name = "APIConnectionError";
    }
}
exports.APIConnectionError = APIConnectionError;
