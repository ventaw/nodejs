"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Resource = void 0;
/**
 * Base resource class for all Ventaw API resources
 */
const client_1 = require("../client");
/**
 * Abstract base class for API resources providing common CRUD operations
 */
class Resource {
    constructor(data) {
        this._data = data;
        this.id = data.id;
        this._client = (0, client_1.getDefaultClient)();
    }
    /**
     * Get the API endpoint for this resource type
     * Must be overridden in subclasses
     */
    static getEndpoint() {
        throw new Error("Must override getEndpoint() in subclass");
    }
    /**
     * Get the list key for responses wrapped in objects
     * Override if the list response uses a non-standard key
     */
    static getListKey() {
        // Auto-detect from endpoint: "/templates" -> "templates"
        const endpoint = this.getEndpoint();
        const cleaned = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
        return cleaned.split("/")[0] || null;
    }
    /**
     * Refresh resource attributes from API
     * Fetches the latest data and updates this instance
     */
    async refresh() {
        if (!this.id) {
            throw new Error(`${this.constructor.name} ID is missing`);
        }
        const endpoint = this.constructor.getEndpoint();
        const data = await this._client.request("GET", `${endpoint}/${this.id}`);
        Object.assign(this, data);
    }
    /**
     * Delete this resource
     * @returns True if deletion was successful
     */
    async delete() {
        if (!this.id) {
            throw new Error(`${this.constructor.name} ID is missing`);
        }
        const endpoint = this.constructor.getEndpoint();
        await this._client.request("DELETE", `${endpoint}/${this.id}`);
        return true;
    }
    /**
     * Get a resource by ID
     * @param id The resource ID
     * @returns Instance of the resource
     */
    static async get(id) {
        const client = (0, client_1.getDefaultClient)();
        const endpoint = this.getEndpoint();
        const data = await client.request("GET", `${endpoint}/${id}`);
        return new this(data);
    }
    /**
     * List all resources
     * @param params Optional query parameters for filtering/pagination
     * @returns Array of resource instances
     */
    static async list(params) {
        const client = (0, client_1.getDefaultClient)();
        const endpoint = this.getEndpoint();
        const data = await client.request("GET", endpoint, undefined, params);
        // Handle both array and object-wrapped responses
        let items;
        if (Array.isArray(data)) {
            items = data;
        }
        else if (typeof data === "object" && data !== null) {
            // Try common keys: items, or resource-specific key
            const listKey = this.getListKey();
            items = data.items || data[listKey] || [];
        }
        else {
            items = [];
        }
        return items.map((item) => new this(item));
    }
}
exports.Resource = Resource;
