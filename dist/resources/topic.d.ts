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
export declare class Subscription {
    id: string;
    topicId: string;
    name: string;
    webhookUrl?: string;
    createdAt?: string;
    private _client;
    constructor(data: SubscriptionData);
    delete(): Promise<boolean>;
}
export declare class Topic {
    id: string;
    name: string;
    region?: string;
    connectionString?: string;
    createdAt?: string;
    private _client;
    constructor(data: TopicData);
    static create(name: string): Promise<Topic>;
    static get(id: string): Promise<Topic>;
    static list(): Promise<Topic[]>;
    delete(): Promise<boolean>;
    publish(body: any): Promise<string>;
    subscribe(name: string, webhookUrl?: string): Promise<Subscription>;
    listSubscriptions(): Promise<Subscription[]>;
}
