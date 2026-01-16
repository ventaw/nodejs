import { getDefaultClient } from "../client";
import { Resource } from "./base";

export interface TemplateData {
    id: string;
    code?: string;
    user_id?: string;
    is_system?: boolean;
    is_public?: boolean;
    use_count?: number;
    name: string;
    description?: string;
    icon?: string;
    category?: string;
    default_port?: number;
    recommended_vcpu?: number;
    recommended_mem_mib?: number;
    startup_command?: string;
    created_at?: string;
    // Detail fields
    init_commands?: string[];
    packages?: string[];
    pip_packages?: string[];
    npm_packages?: string[];
    dockerfile?: string;
    updated_at?: string;
}

export class Template extends Resource {
    public code?: string;
    public userId?: string;
    public isSystem?: boolean;
    public isPublic?: boolean;
    public useCount?: number;
    public name: string;
    public description?: string;
    public icon?: string;
    public category?: string;
    public defaultPort?: number;
    public recommendedVcpu?: number;
    public recommendedMemMib?: number;
    public startupCommand?: string;
    public createdAt?: string;
    // Detail fields
    public initCommands?: string[];
    public packages?: string[];
    public pipPackages?: string[];
    public npmPackages?: string[];
    public dockerfile?: string;
    public updatedAt?: string;

    constructor(data: TemplateData) {
        super(data);
        this.code = data.code;
        this.userId = data.user_id;
        this.isSystem = data.is_system;
        this.isPublic = data.is_public;
        this.useCount = data.use_count;
        this.name = data.name;
        this.description = data.description;
        this.icon = data.icon;
        this.category = data.category;
        this.defaultPort = data.default_port;
        this.recommendedVcpu = data.recommended_vcpu;
        this.recommendedMemMib = data.recommended_mem_mib;
        this.startupCommand = data.startup_command;
        this.createdAt = data.created_at;
        this.initCommands = data.init_commands;
        this.packages = data.packages;
        this.pipPackages = data.pip_packages;
        this.npmPackages = data.npm_packages;
        this.dockerfile = data.dockerfile;
        this.updatedAt = data.updated_at;
    }

    protected static getEndpoint(): string {
        return "/templates";
    }

    protected static getListKey(): string {
        return "templates";
    }

    public static async create(options: {
        name: string;
        description: string;
        category?: string;
        icon?: string;
        isPublic?: boolean;
        defaultPort?: number;
        recommendedVcpu?: number;
        recommendedMemMib?: number;
        startupCommand?: string;
        initCommands?: string[];
        packages?: string[];
        pipPackages?: string[];
        npmPackages?: string[];
    }): Promise<Template> {
        const client = getDefaultClient();
        const payload: any = {
            name: options.name,
            description: options.description,
            category: options.category || "OTHER",
            is_public: options.isPublic || false,
            recommended_vcpu: options.recommendedVcpu || 2,
            recommended_mem_mib: options.recommendedMemMib || 2048,
        };

        if (options.icon) payload.icon = options.icon;
        if (options.defaultPort) payload.default_port = options.defaultPort;
        if (options.startupCommand) payload.startup_command = options.startupCommand;
        if (options.initCommands) payload.init_commands = options.initCommands;
        if (options.packages) payload.packages = options.packages;
        if (options.pipPackages) payload.pip_packages = options.pipPackages;
        if (options.npmPackages) payload.npm_packages = options.npmPackages;

        const data = await client.request<TemplateData>("POST", "/templates", payload);
        return new Template(data);
    }

    public async update(options: {
        name?: string;
        description?: string;
        icon?: string;
        category?: string;
        isPublic?: boolean;
        defaultPort?: number;
        startupCommand?: string;
    }): Promise<boolean> {
        if (!this.id) throw new Error("Template ID is missing");

        const payload: any = {};
        if (options.name !== undefined) payload.name = options.name;
        if (options.description !== undefined) payload.description = options.description;
        if (options.icon !== undefined) payload.icon = options.icon;
        if (options.category !== undefined) payload.category = options.category;
        if (options.isPublic !== undefined) payload.is_public = options.isPublic;
        if (options.defaultPort !== undefined) payload.default_port = options.defaultPort;
        if (options.startupCommand !== undefined) payload.startup_command = options.startupCommand;

        const data = await this._client.request<TemplateData>("PATCH", `/templates/${this.id}`, payload);
        Object.assign(this, data);
        return true;
    }
}
