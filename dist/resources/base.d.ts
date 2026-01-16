/**
 * Base resource class for all Ventaw API resources
 */
import { Client } from "../client";
/**
 * Abstract base class for API resources providing common CRUD operations
 */
export declare abstract class Resource {
    protected _client: Client;
    protected _data: any;
    id: string;
    constructor(data: any);
    /**
     * Get the API endpoint for this resource type
     * Must be overridden in subclasses
     */
    protected static getEndpoint(): string;
    /**
     * Get the list key for responses wrapped in objects
     * Override if the list response uses a non-standard key
     */
    protected static getListKey(): string | null;
    /**
     * Refresh resource attributes from API
     * Fetches the latest data and updates this instance
     */
    refresh(): Promise<void>;
    /**
     * Delete this resource
     * @returns True if deletion was successful
     */
    delete(): Promise<boolean>;
    /**
     * Get a resource by ID
     * @param id The resource ID
     * @returns Instance of the resource
     */
    static get<T extends Resource>(this: new (data: any) => T, id: string): Promise<T>;
    /**
     * List all resources
     * @param params Optional query parameters for filtering/pagination
     * @returns Array of resource instances
     */
    static list<T extends Resource>(this: new (data: any) => T, params?: any): Promise<T[]>;
}
