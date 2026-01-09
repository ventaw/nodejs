"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Queue = exports.Message = void 0;
const client_1 = require("../client");
class Message {
    constructor(data) {
        this.id = data.id;
        this.body = data.body;
        this.ackToken = data.ack_token;
        this.state = data.state;
        this.attempt = data.attempt;
        this.visibleAt = data.visible_at;
    }
}
exports.Message = Message;
class Queue {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.backend = data.backend;
        this.useCase = data.use_case;
        this.region = data.region;
        this.connectionString = data.connection_string;
        this.createdAt = data.created_at;
        this._client = (0, client_1.getDefaultClient)();
    }
    static async create(name, useCase = "general_purpose", visibilityTimeout = 30) {
        const client = (0, client_1.getDefaultClient)();
        const payload = {
            name: name,
            use_case: useCase,
            visibility_timeout_seconds: visibilityTimeout,
        };
        const data = await client.request("POST", "/queues", payload);
        return new Queue(data);
    }
    static async get(id) {
        const client = (0, client_1.getDefaultClient)();
        const data = await client.request("GET", `/queues/${id}`);
        return new Queue(data);
    }
    static async list() {
        const client = (0, client_1.getDefaultClient)();
        const data = await client.request("GET", "/queues");
        const items = Array.isArray(data) ? data : (data.items || []);
        return items.map((item) => new Queue(item));
    }
    async delete() {
        await this._client.request("DELETE", `/queues/${this.id}`);
        return true;
    }
    async send(body, delaySeconds = 0) {
        const payload = {
            body: body,
            delay_seconds: delaySeconds,
        };
        const data = await this._client.request("POST", `/queues/${this.id}/messages`, payload);
        return data.message_id;
    }
    async receive(consumerId) {
        const params = {};
        if (consumerId) {
            params.consumer_id = consumerId;
        }
        const data = await this._client.request("POST", `/queues/${this.id}/receive`, null, params);
        if (!data)
            return null;
        return new Message(data);
    }
    async ack(ackToken) {
        const payload = { ack_token: ackToken };
        await this._client.request("POST", "/messages/ack", payload);
        return true;
    }
}
exports.Queue = Queue;
