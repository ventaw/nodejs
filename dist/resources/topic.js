"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Topic = exports.Subscription = void 0;
const client_1 = require("../client");
class Subscription {
    constructor(data) {
        this.id = data.id;
        this.topicId = data.topic_id;
        this.name = data.name;
        this.webhookUrl = data.webhook_url;
        this.createdAt = data.created_at;
        this._client = (0, client_1.getDefaultClient)();
    }
    async delete() {
        await this._client.request("DELETE", `/topics/${this.topicId}/subscriptions/${this.id}`);
        return true;
    }
}
exports.Subscription = Subscription;
class Topic {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.region = data.region;
        this.connectionString = data.connection_string;
        this.createdAt = data.created_at;
        this._client = (0, client_1.getDefaultClient)();
    }
    static async create(name) {
        const client = (0, client_1.getDefaultClient)();
        const payload = { name };
        const data = await client.request("POST", "/topics", payload);
        return new Topic(data);
    }
    static async get(id) {
        const client = (0, client_1.getDefaultClient)();
        const data = await client.request("GET", `/topics/${id}`);
        return new Topic(data);
    }
    static async list() {
        const client = (0, client_1.getDefaultClient)();
        const data = await client.request("GET", "/topics");
        return (Array.isArray(data) ? data : []).map((item) => new Topic(item));
    }
    async delete() {
        await this._client.request("DELETE", `/topics/${this.id}`);
        return true;
    }
    async publish(body) {
        const payload = { body };
        const data = await this._client.request("POST", `/topics/${this.id}/publish`, payload);
        return data.message_id;
    }
    async subscribe(name, webhookUrl) {
        const payload = {
            name,
            webhook_url: webhookUrl,
        };
        const data = await this._client.request("POST", `/topics/${this.id}/subscriptions`, payload);
        return new Subscription(data);
    }
    async listSubscriptions() {
        const data = await this._client.request("GET", `/topics/${this.id}/subscriptions`);
        return (Array.isArray(data) ? data : []).map((item) => new Subscription(item));
    }
}
exports.Topic = Topic;
