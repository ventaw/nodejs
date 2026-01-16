/**
 * Base resource class for all Ventaw API resources
 */
import { getDefaultClient, Client } from "../client";

/**
 * Abstract base class for API resources providing common CRUD operations
 */
export abstract class Resource {
    protected _client: Client;
    protected _data: any;
    public id: string;

    constructor(data: any) {
        this._data = data;
        this.id = data.id;
        this._client = getDefaultClient();
    }

    /**
     * Get the API endpoint for this resource type
     * Must be overridden in subclasses
     */
    protected static getEndpoint(): string {
        throw new Error("Must override getEndpoint() in subclass");
    }

    /**
     * Get the list key for responses wrapped in objects
     * Override if the list response uses a non-standard key
     */
    protected static getListKey(): string | null {
        // Auto-detect from endpoint: "/templates" -> "templates"
        const endpoint = this.getEndpoint();
        const cleaned = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
        return cleaned.split("/")[0] || null;
    }

    /**
     * Refresh resource attributes from API
     * Fetches the latest data and updates this instance
     */
    public async refresh(): Promise<void> {
        if (!this.id) {
            throw new Error(`${this.constructor.name} ID is missing`);
        }
        const endpoint = (this.constructor as any).getEndpoint();
        const data = await this._client.request("GET", `${endpoint}/${this.id}`);
        Object.assign(this, data);
    }

    /**
     * Delete this resource
     * @returns True if deletion was successful
     */
    public async delete(): Promise<boolean> {
        if (!this.id) {
            throw new Error(`${this.constructor.name} ID is missing`);
        }
        const endpoint = (this.constructor as any).getEndpoint();
        await this._client.request("DELETE", `${endpoint}/${this.id}`);
        return true;
    }

    /**
     * Get a resource by ID
     * @param id The resource ID
     * @returns Instance of the resource
     */
    public static async get<T extends Resource>(
        this: new (data: any) => T,
        id: string
    ): Promise<T> {
        const client = getDefaultClient();
        const endpoint = (this as any).getEndpoint();
        const data = await client.request("GET", `${endpoint}/${id}`);
        return new this(data);
    }

    /**
     * List all resources
     * @param params Optional query parameters for filtering/pagination
     * @returns Array of resource instances
     */
    public static async list<T extends Resource>(
        this: new (data: any) => T,
        params?: any
    ): Promise<T[]> {
        const client = getDefaultClient();
        const endpoint = (this as any).getEndpoint();
        const data = await client.request("GET", endpoint, undefined, params);

        // Handle both array and object-wrapped responses
        let items: any[];
        if (Array.isArray(data)) {
            items = data;
        } else if (typeof data === "object" && data !== null) {
            // Try common keys: items, or resource-specific key
            const listKey = (this as any).getListKey();
            items = data.items || data[listKey] || [];
        } else {
            items = [];
        }

        return items.map((item) => new this(item));
    }
}
