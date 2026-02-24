"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecretIO = void 0;
class SecretIO {
    constructor(client) {
        this._client = client;
    }
    async list() {
        return await this._client.request("GET", "/secrets/");
    }
    async set(name, value, description) {
        return await this._client.request("POST", "/secrets/", {
            name,
            value,
            description
        });
    }
    async get(name) {
        const res = await this._client.request("GET", `/secrets/${name}`);
        return res.value;
    }
    async delete(name) {
        await this._client.request("DELETE", `/secrets/${name}`);
        return true;
    }
}
exports.SecretIO = SecretIO;
