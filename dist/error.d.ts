export declare class VentawError extends Error {
    constructor(message: string);
}
export declare class APIError extends VentawError {
    statusCode?: number;
    constructor(message: string, statusCode?: number);
}
export declare class AuthenticationError extends APIError {
    constructor(message: string);
}
export declare class APIConnectionError extends VentawError {
    constructor(message: string);
}
