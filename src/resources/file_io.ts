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
        const data = await this.client.request<{ content: string }>(
            "GET",
            `/sandboxes/${this.sandboxId}/files/content`,
            undefined,
            { path }
        );

        let content = data.content;
        if (options?.encoding === 'base64') {
            // If API returned text but we want base64, convert it
            // Assuming API returns raw content as string
            content = Buffer.from(content).toString('base64');
        }
        return content;
    }

    public async write(path: string, content: string, options?: { encoding?: "utf-8" | "base64" }): Promise<void> {
        const payload = {
            path: path,
            content: content
        };

        // Note: encoding in payload is not currently supported by API JSON endpoint 
        // but we can handle it here if needed.

        await this.client.request(
            "POST",
            `/sandboxes/${this.sandboxId}/files/write`,
            payload
        );
    }

    public async createDir(path: string): Promise<boolean> {
        await this.client.request(
            "POST",
            `/sandboxes/${this.sandboxId}/files/mkdir`,
            undefined,
            { path }
        );
        return true;
    }

    public async createDirectory(path: string): Promise<boolean> {
        return this.createDir(path);
    }

    public async delete(path: string, options?: { recursive?: boolean }): Promise<boolean> {
        await this.client.request(
            "DELETE",
            `/sandboxes/${this.sandboxId}/files`,
            undefined,
            { path, recursive: options?.recursive }
        );
        return true;
    }

    public async deleteFile(path: string): Promise<boolean> {
        return this.delete(path);
    }

    public async deleteDirectory(path: string): Promise<boolean> {
        return this.delete(path, { recursive: true });
    }

    public async batchWrite(files: Record<string, string>, createDirs: boolean = true): Promise<any> {
        return await this.client.request(
            "POST",
            `/sandboxes/${this.sandboxId}/files/batch`,
            { files, create_dirs: createDirs }
        );
    }
}
