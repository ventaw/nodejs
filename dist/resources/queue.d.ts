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
export declare class Message {
    id: string;
    body: any;
    ackToken?: string;
    state?: string;
    attempt?: number;
    visibleAt?: string;
    constructor(data: MessageData);
}
export declare class Queue {
    id: string;
    name: string;
    backend?: string;
    useCase?: string;
    region?: string;
    connectionString?: string;
    createdAt?: string;
    private _client;
    constructor(data: QueueData);
    static create(name: string, useCase?: string, visibilityTimeout?: number): Promise<Queue>;
    static get(id: string): Promise<Queue>;
    static list(): Promise<Queue[]>;
    delete(): Promise<boolean>;
    send(body: any, delaySeconds?: number): Promise<string>;
    receive(consumerId?: string): Promise<Message | null>;
    ack(ackToken: string): Promise<boolean>;
}
