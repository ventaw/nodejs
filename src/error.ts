export class VentawError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "VentawError";
    }
}

export class APIError extends VentawError {
    statusCode?: number;

    constructor(message: string, statusCode?: number) {
        super(message);
        this.name = "APIError";
        this.statusCode = statusCode;
    }
}

export class AuthenticationError extends APIError {
    constructor(message: string) {
        super(message, 401);
        this.name = "AuthenticationError";
    }
}

export class APIConnectionError extends VentawError {
    constructor(message: string) {
        super(message);
        this.name = "APIConnectionError";
    }
}
