"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Template = void 0;
const client_1 = require("../client");
const base_1 = require("./base");
class Template extends base_1.Resource {
    constructor(data) {
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
    static getEndpoint() {
        return "/templates";
    }
    static getListKey() {
        return "templates";
    }
    static async create(options) {
        const client = (0, client_1.getDefaultClient)();
        const payload = {
            name: options.name,
            description: options.description,
            category: options.category || "OTHER",
            is_public: options.isPublic || false,
            recommended_vcpu: options.recommendedVcpu || 2,
            recommended_mem_mib: options.recommendedMemMib || 2048,
        };
        if (options.icon)
            payload.icon = options.icon;
        if (options.defaultPort)
            payload.default_port = options.defaultPort;
        if (options.startupCommand)
            payload.startup_command = options.startupCommand;
        if (options.initCommands)
            payload.init_commands = options.initCommands;
        if (options.packages)
            payload.packages = options.packages;
        if (options.pipPackages)
            payload.pip_packages = options.pipPackages;
        if (options.npmPackages)
            payload.npm_packages = options.npmPackages;
        const data = await client.request("POST", "/templates", payload);
        return new Template(data);
    }
    async update(options) {
        if (!this.id)
            throw new Error("Template ID is missing");
        const payload = {};
        if (options.name !== undefined)
            payload.name = options.name;
        if (options.description !== undefined)
            payload.description = options.description;
        if (options.icon !== undefined)
            payload.icon = options.icon;
        if (options.category !== undefined)
            payload.category = options.category;
        if (options.isPublic !== undefined)
            payload.is_public = options.isPublic;
        if (options.defaultPort !== undefined)
            payload.default_port = options.defaultPort;
        if (options.startupCommand !== undefined)
            payload.startup_command = options.startupCommand;
        const data = await this._client.request("PATCH", `/templates/${this.id}`, payload);
        Object.assign(this, data);
        return true;
    }
}
exports.Template = Template;
