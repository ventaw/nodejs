import { getDefaultClient } from "../client";

export interface TemplateData {
    code: string;
    name: string;
    description?: string;
    default_cpu?: number;
    default_memory?: number;
}

export class Template {
    public code: string;
    public name: string;
    public description?: string;
    public default_cpu?: number;
    public default_memory?: number;

    constructor(data: TemplateData) {
        this.code = data.code;
        this.name = data.name;
        this.description = data.description;
        this.default_cpu = data.default_cpu;
        this.default_memory = data.default_memory;
    }

    public static async list(): Promise<Template[]> {
        const client = getDefaultClient();
        const data = await client.request("GET", "/templates");
        // API returns {"templates": [...], "total": ...}
        const items = data.templates || [];
        return items.map((item: any) => new Template(item));
    }
}
