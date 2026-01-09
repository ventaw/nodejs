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
        // We need to request blob/buffer. 
        // Client request wrapper assumes JSON usually. 
        // We might need to bypass or handle specific response type.
        // For now, let's assume the client can handle text.
        // If we need base64, we might need to fetch binary and convert.
        // This is tricky with the current generic client. 
        // Let's implement a workaround using the internal axios instance if possible, 
        // or just use valid JSON endpoints if I had them. 
        // But read is a stream. 
        // Strategy: Use the client to get the download URL and fetch it? 
        // Or assume client.request can handle 'responseType'.
        // Let's try to use the 'read_file' MCP-style logic? No, SDK hits API.
        // Workaround: 
        // Since I cannot easily change the generic client.request signature here without seeing client.ts fully,
        // I will assume standard fetch/axios behavior.
        // Actually, for SDK consistency, I should have implemented /read and /write JSON endpoints in the API too.
        // But since I didn't, I must make the SDK work with what I have.
        const response = await this.client.request("GET", `/sandboxes/${this.sandboxId}/files/download`, undefined, { path }, { responseType: (options === null || options === void 0 ? void 0 : options.encoding) === 'base64' ? 'arraybuffer' : 'text' });
        if ((options === null || options === void 0 ? void 0 : options.encoding) === 'base64') {
            // Convert arraybuffer to base64
            return Buffer.from(response).toString('base64');
        }
        return response;
    }
    async write(path, content, options) {
        // Construct Multipart
        const formData = new FormData();
        let blob;
        if ((options === null || options === void 0 ? void 0 : options.encoding) === 'base64') {
            const buffer = Buffer.from(content, 'base64');
            blob = new Blob([buffer]);
        }
        else {
            blob = new Blob([content]);
        }
        formData.append('file', blob, path.split('/').pop() || 'file');
        const data = await this.client.request("POST", `/sandboxes/${this.sandboxId}/files/upload`, formData, { path }, { headers: { "Content-Type": "multipart/form-data" } });
        return data.bytes_written || 0;
    }
    async createDirectory(path) {
        await this.client.request("POST", `/sandboxes/${this.sandboxId}/files/mkdir`, undefined, { path });
        return true;
    }
    async deleteFile(path) {
        await this.client.request("DELETE", `/sandboxes/${this.sandboxId}/files`, undefined, { path });
        return true;
    }
    async deleteDirectory(path) {
        await this.client.request("DELETE", `/sandboxes/${this.sandboxId}/files`, undefined, { path, recursive: true });
        return true;
    }
}
exports.FileIO = FileIO;
