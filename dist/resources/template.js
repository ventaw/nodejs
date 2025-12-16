"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Template = void 0;
const client_1 = require("../client");
class Template {
    constructor(data) {
        this.code = data.code;
        this.name = data.name;
        this.description = data.description;
        this.default_cpu = data.default_cpu;
        this.default_memory = data.default_memory;
    }
    static async list() {
        const client = (0, client_1.getDefaultClient)();
        const data = await client.request("GET", "/templates");
        // API returns {"templates": [...], "total": ...}
        const items = data.templates || [];
        return items.map((item) => new Template(item));
    }
}
exports.Template = Template;
