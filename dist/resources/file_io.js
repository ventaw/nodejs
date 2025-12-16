"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileIO = void 0;
class FileIO {
    constructor(client, sandboxId) {
        this.client = client;
        this.sandboxId = sandboxId;
    }
    async list(path = ".") {
        const data = await this.client.request("POST", `/sandboxes/${this.sandboxId}/files/list`, { path });
        return data.items || [];
    }
    async read(path) {
        const data = await this.client.request("POST", `/sandboxes/${this.sandboxId}/files/read`, { path });
        return data.content || "";
    }
    async write(path, content) {
        const data = await this.client.request("POST", `/sandboxes/${this.sandboxId}/files/write`, { path, content });
        return data.bytes_written || 0;
    }
    async createDir(path) {
        await this.client.request("POST", `/sandboxes/${this.sandboxId}/files/create_dir`, { path });
        return true;
    }
    async delete(path) {
        await this.client.request("POST", `/sandboxes/${this.sandboxId}/files/delete`, { path });
        return true;
    }
    async deleteDir(path) {
        await this.client.request("POST", `/sandboxes/${this.sandboxId}/files/delete_dir`, { path });
        return true;
    }
}
exports.FileIO = FileIO;
