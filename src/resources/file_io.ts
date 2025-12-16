import { Client } from "../client";

export interface FileItem {
    name: string;
    path: string;
    size: number;
    type: "file" | "directory";
}

export class FileIO {
    private client: Client;
    private sandboxId: string;

    constructor(client: Client, sandboxId: string) {
        this.client = client;
        this.sandboxId = sandboxId;
    }

    public async list(path: string = "."): Promise<FileItem[]> {
        const data = await this.client.request(
            "POST",
            `/sandboxes/${this.sandboxId}/files/list`,
            { path }
        );
        return data.items || [];
    }

    public async read(path: string): Promise<string> {
        const data = await this.client.request(
            "POST",
            `/sandboxes/${this.sandboxId}/files/read`,
            { path }
        );
        return data.content || "";
    }

    public async write(path: string, content: string): Promise<number> {
        const data = await this.client.request(
            "POST",
            `/sandboxes/${this.sandboxId}/files/write`,
            { path, content }
        );
        return data.bytes_written || 0;
    }

    public async createDir(path: string): Promise<boolean> {
        await this.client.request(
            "POST",
            `/sandboxes/${this.sandboxId}/files/create_dir`,
            { path }
        );
        return true;
    }

    public async delete(path: string): Promise<boolean> {
        await this.client.request(
            "POST",
            `/sandboxes/${this.sandboxId}/files/delete`,
            { path }
        );
        return true;
    }

    public async deleteDir(path: string): Promise<boolean> {
        await this.client.request(
            "POST",
            `/sandboxes/${this.sandboxId}/files/delete_dir`,
            { path }
        );
        return true;
    }
}
