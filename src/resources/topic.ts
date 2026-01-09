
import { getDefaultClient, Client } from "../client";

export interface SubscriptionData {
    id: string;
    topic_id: string;
    name: string;
    webhook_url?: string;
    created_at?: string;
}

export interface TopicData {
    id: string;
    name: string;
    region?: string;
    connection_string?: string;
    created_at?: string;
}

export class Subscription {
    public id: string;
    public topicId: string;
    public name: string;
    public webhookUrl?: string;
    public createdAt?: string;
    private _client: Client;

    constructor(data: SubscriptionData) {
        this.id = data.id;
        this.topicId = data.topic_id;
        this.name = data.name;
        this.webhookUrl = data.webhook_url;
        this.createdAt = data.created_at;
        this._client = getDefaultClient();
    }

    public async delete(): Promise<boolean> {
        await this._client.request(
            "DELETE",
            `/topics/${this.topicId}/subscriptions/${this.id}`
        );
        return true;
    }
}

export class Topic {
    public id: string;
    public name: string;
    public region?: string;
    public connectionString?: string;
    public createdAt?: string;
    private _client: Client;

    constructor(data: TopicData) {
        this.id = data.id;
        this.name = data.name;
        this.region = data.region;
        this.connectionString = data.connection_string;
        this.createdAt = data.created_at;
        this._client = getDefaultClient();
    }

    public static async create(name: string): Promise<Topic> {
        const client = getDefaultClient();
        const payload = { name };
        const data = await client.request<TopicData>("POST", "/topics", payload);
        return new Topic(data);
    }

    public static async get(id: string): Promise<Topic> {
        const client = getDefaultClient();
        const data = await client.request<TopicData>("GET", `/topics/${id}`);
        return new Topic(data);
    }

    public static async list(): Promise<Topic[]> {
        const client = getDefaultClient();
        const data = await client.request<TopicData[]>("GET", "/topics");
        return (Array.isArray(data) ? data : []).map(
            (item) => new Topic(item)
        );
    }

    public async delete(): Promise<boolean> {
        await this._client.request("DELETE", `/topics/${this.id}`);
        return true;
    }

    public async publish(body: any): Promise<string> {
        const payload = { body };
        const data = await this._client.request<any>(
            "POST",
            `/topics/${this.id}/publish`,
            payload
        );
        return data.message_id;
    }

    public async subscribe(
        name: string,
        webhookUrl?: string
    ): Promise<Subscription> {
        const payload = {
            name,
            webhook_url: webhookUrl,
        };
        const data = await this._client.request<SubscriptionData>(
            "POST",
            `/topics/${this.id}/subscriptions`,
            payload
        );
        return new Subscription(data);
    }

    public async listSubscriptions(): Promise<Subscription[]> {
        const data = await this._client.request<SubscriptionData[]>(
            "GET",
            `/topics/${this.id}/subscriptions`
        );
        return (Array.isArray(data) ? data : []).map(
            (item) => new Subscription(item)
        );
    }
}
