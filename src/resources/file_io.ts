import { Client } from "../client";

export interface FileItem {
    name: string;
    path: string;
    size: number;
    type: "file" | "directory";
}

export interface WatchEvent {
    type: "create" | "write" | "delete";
    path: string;
}

export class FileIO {
    private client: Client;
    private sandboxId: string;

    constructor(client: Client, sandboxId: string) {
        this.client = client;
        this.sandboxId = sandboxId;
    }

    public async list(path: string = ".", options?: { recursive?: boolean }): Promise<FileItem[]> {
        const data = await this.client.request<{ items: FileItem[] }>(
            "GET",
            `/sandboxes/${this.sandboxId}/files/list`,
            undefined,
            { path, recursive: options?.recursive }
        );
        return data.items || [];
    }

    public async read(path: string, options?: { encoding?: "utf-8" | "base64" }): Promise<string> {
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

        const response = await this.client.request<any>(
            "GET",
            `/sandboxes/${this.sandboxId}/files/download`,
            undefined,
            { path },
            { responseType: options?.encoding === 'base64' ? 'arraybuffer' : 'text' }
        );

        if (options?.encoding === 'base64') {
            // Convert arraybuffer to base64
            return Buffer.from(response).toString('base64');
        }
        return response as string;
    }

    public async write(path: string, content: string, options?: { encoding?: "utf-8" | "base64" }): Promise<number> {
        // Construct Multipart
        const formData = new FormData();
        let blob: Blob;

        if (options?.encoding === 'base64') {
            const buffer = Buffer.from(content, 'base64');
            blob = new Blob([buffer]);
        } else {
            blob = new Blob([content]);
        }

        formData.append('file', blob, path.split('/').pop() || 'file');

        const data = await this.client.request<{ bytes_written: number }>(
            "POST",
            `/sandboxes/${this.sandboxId}/files/upload`,
            formData,
            { path },
            { headers: { "Content-Type": "multipart/form-data" } }
        );
        return data.bytes_written || 0;
    }

    public async createDirectory(path: string): Promise<boolean> {
        await this.client.request(
            "POST",
            `/sandboxes/${this.sandboxId}/files/mkdir`,
            undefined,
            { path }
        );
        return true;
    }

    public async deleteFile(path: string): Promise<boolean> {
        await this.client.request(
            "DELETE",
            `/sandboxes/${this.sandboxId}/files`,
            undefined,
            { path }
        );
        return true;
    }

    public async deleteDirectory(path: string): Promise<boolean> {
        await this.client.request(
            "DELETE",
            `/sandboxes/${this.sandboxId}/files`,
            undefined,
            { path, recursive: true }
        );
        return true;
    }
}
