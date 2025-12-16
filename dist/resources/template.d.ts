export interface TemplateData {
    code: string;
    name: string;
    description?: string;
    default_cpu?: number;
    default_memory?: number;
}
export declare class Template {
    code: string;
    name: string;
    description?: string;
    default_cpu?: number;
    default_memory?: number;
    constructor(data: TemplateData);
    static list(): Promise<Template[]>;
}
