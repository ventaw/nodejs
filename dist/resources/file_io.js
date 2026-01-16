"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileIO = void 0;
class FileIO {
    constructor(client, sandboxId) {
        this.client = client;
        this.sandboxId = sandboxId;
    }
    async list(path = ".", options) {
        const data = await this.client.request("GET", `/sandboxes/${this.sandboxId}/files/list`, undefined, { path, recursive: options === null || options === void 0 ? void 0 : options.recursive });
        return data.items || [];
    }
    async read(path, options) {
        const data = await this.client.request("GET", `/sandboxes/${this.sandboxId}/files/content`, undefined, { path });
        let content = data.content;
        if ((options === null || options === void 0 ? void 0 : options.encoding) === 'base64') {
            // If API returned text but we want base64, convert it
            // Assuming API returns raw content as string
            content = Buffer.from(content).toString('base64');
        }
        return content;
    }
    async write(path, content, options) {
        const payload = {
            path: path,
            content: content
        };
        // Note: encoding in payload is not currently supported by API JSON endpoint 
        // but we can handle it here if needed.
        await this.client.request("POST", `/sandboxes/${this.sandboxId}/files/write`, payload);
    }
    async createDir(path) {
        await this.client.request("POST", `/sandboxes/${this.sandboxId}/files/mkdir`, undefined, { path });
        return true;
    }
    async createDirectory(path) {
        return this.createDir(path);
    }
    async delete(path, options) {
        await this.client.request("DELETE", `/sandboxes/${this.sandboxId}/files`, undefined, { path, recursive: options === null || options === void 0 ? void 0 : options.recursive });
        return true;
    }
    async deleteFile(path) {
        return this.delete(path);
    }
    async deleteDirectory(path) {
        return this.delete(path, { recursive: true });
    }
    async batchWrite(files, createDirs = true) {
        return await this.client.request("POST", `/sandboxes/${this.sandboxId}/files/batch`, { files, create_dirs: createDirs });
    }
}
exports.FileIO = FileIO;
