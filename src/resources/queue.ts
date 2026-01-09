
import { getDefaultClient, Client } from "../client";

export interface MessageData {
    id: string;
    body: any;
    ack_token?: string;
    state?: string;
    attempt?: number;
    visible_at?: string;
}

export interface QueueData {
    id: string;
    name: string;
    backend?: string;
    use_case?: string;
    region?: string;
    connection_string?: string;
    created_at?: string;
}

export class Message {
    public id: string;
    public body: any;
    public ackToken?: string;
    public state?: string;
    public attempt?: number;
    public visibleAt?: string;

    constructor(data: MessageData) {
        this.id = data.id;
        this.body = data.body;
        this.ackToken = data.ack_token;
        this.state = data.state;
        this.attempt = data.attempt;
        this.visibleAt = data.visible_at;
    }
}

export class Queue {
    public id: string;
    public name: string;
    public backend?: string;
    public useCase?: string;
    public region?: string;
    public connectionString?: string;
    public createdAt?: string;
    private _client: Client;

    constructor(data: QueueData) {
        this.id = data.id;
        this.name = data.name;
        this.backend = data.backend;
        this.useCase = data.use_case;
        this.region = data.region;
        this.connectionString = data.connection_string;
        this.createdAt = data.created_at;
        this._client = getDefaultClient();
    }

    public static async create(
        name: string,
        useCase: string = "general_purpose",
        visibilityTimeout: number = 30
    ): Promise<Queue> {
        const client = getDefaultClient();
        const payload = {
            name: name,
            use_case: useCase,
            visibility_timeout_seconds: visibilityTimeout,
        };
        const data = await client.request<QueueData>("POST", "/queues", payload);
        return new Queue(data);
    }

    public static async get(id: string): Promise<Queue> {
        const client = getDefaultClient();
        const data = await client.request<QueueData>("GET", `/queues/${id}`);
        return new Queue(data);
    }

    public static async list(): Promise<Queue[]> {
        const client = getDefaultClient();
        const data = await client.request<any>("GET", "/queues");
        const items = Array.isArray(data) ? data : (data.items || []);
        return items.map((item: QueueData) => new Queue(item));
    }

    public async delete(): Promise<boolean> {
        await this._client.request("DELETE", `/queues/${this.id}`);
        return true;
    }

    public async send(body: any, delaySeconds: number = 0): Promise<string> {
        const payload = {
            body: body,
            delay_seconds: delaySeconds,
        };
        const data = await this._client.request<any>(
            "POST",
            `/queues/${this.id}/messages`,
            payload
        );
        return data.message_id;
    }

    public async receive(consumerId?: string): Promise<Message | null> {
        const params: any = {};
        if (consumerId) {
            params.consumer_id = consumerId;
        }
        const data = await this._client.request<MessageData | null>(
            "POST",
            `/queues/${this.id}/receive`,
            null,
            params
        );
        if (!data) return null;
        return new Message(data);
    }

    public async ack(ackToken: string): Promise<boolean> {
        const payload = { ack_token: ackToken };
        await this._client.request("POST", "/messages/ack", payload);
        return true;
    }
}
