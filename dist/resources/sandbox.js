"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sandbox = void 0;
const client_1 = require("../client");
const file_io_1 = require("./file_io");
class Sandbox {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.template_id = data.template_id;
        this.state = data.state;
        this.ip_address = data.ip_address;
        this.access_url = data.access_url;
        this.created_at = data.created_at;
        this._client = (0, client_1.getDefaultClient)();
    }
    get files() {
        if (!this.id) {
            throw new Error("Sandbox ID is missing.");
        }
        return new file_io_1.FileIO(this._client, this.id);
    }
    static async create(template, name, vcpu = 2, memory = 2048) {
        const client = (0, client_1.getDefaultClient)();
        const payload = {
            template_id: template,
            name: name,
            vcpu_count: vcpu,
            mem_size_mib: memory,
        };
        const data = await client.request("POST", "/sandboxes", payload);
        return new Sandbox(data);
    }
    static async get(id) {
        const client = (0, client_1.getDefaultClient)();
        const data = await client.request("GET", `/sandboxes/${id}`);
        return new Sandbox(data);
    }
    static async list() {
        const client = (0, client_1.getDefaultClient)();
        const data = await client.request("GET", "/sandboxes");
        // Assuming API returns array as per Python SDK comment
        return (Array.isArray(data) ? data : []).map((item) => new Sandbox(item));
    }
    async delete() {
        if (!this.id) {
            throw new Error("Sandbox ID is missing.");
        }
        await this._client.request("DELETE", `/sandboxes/${this.id}`);
        return true;
    }
    async refresh() {
        if (!this.id) {
            throw new Error("Sandbox ID is missing.");
        }
        const data = await this._client.request("GET", `/sandboxes/${this.id}`);
        Object.assign(this, data);
    }
}
exports.Sandbox = Sandbox;
