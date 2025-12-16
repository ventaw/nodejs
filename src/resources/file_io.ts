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
            "POST",
            `/sandboxes/${this.sandboxId}/files/list`,
            { path, recursive: options?.recursive }
        );
        return data.items || [];
    }

    public async read(path: string): Promise<string> {
        const data = await this.client.request<{ content: string }>(
            "POST",
            `/sandboxes/${this.sandboxId}/files/read`,
            { path }
        );
        return data.content || "";
    }

    /**
     * Write single file.
     */
    public async write(path: string, content: string): Promise<number> {
        const data = await this.client.request<{ bytes_written: number }>(
            "POST",
            `/sandboxes/${this.sandboxId}/files/write`,
            { path, content }
        );
        return data.bytes_written || 0;
    }

    /**
     * Write multiple files in parallel.
     * @param files Array of { path, content } objects.
     */
    public async writeTree(files: { path: string; content: string }[]): Promise<void> {
        await Promise.all(
            files.map((file) => this.write(file.path, file.content))
        );
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

    /**
     * Watch a directory for changes using Server-Sent Events (SSE).
     * @param path Directory path to watch.
     * @param callback Function called with file events.
     * @param options.recursive Whether to watch recursively.
     * @returns unsubscribe function.
     */
    public async watch(
        path: string,
        callback: (event: WatchEvent) => void,
        options?: { recursive?: boolean }
    ): Promise<() => void> {
        // Construct URL for streaming endpoint
        const apiBase = (this.client as any).apiBase; // Access private property (or should expose it?)
        // Assuming apiBase usually doesn't end with slash, but let's be safe
        const baseUrl = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
        const url = `${baseUrl}/sandboxes/${this.sandboxId}/files/watch?path=${encodeURIComponent(path)}&recursive=${options?.recursive || false}`;

        const headers: any = {
            "Content-Type": "application/json",
        };
        const apiKey = (this.client as any).apiKey;
        if (apiKey) {
            headers["X-API-Key"] = apiKey;
        }

        const controller = new AbortController();
        const signal = controller.signal;

        // Use fetch for streaming response
        // Note: fetch is available in Node.js 18+ and Browsers.
        // If older Node env, this might fail, but we assume modern env for this feature.
        (async () => {
            try {
                const response = await fetch(url, {
                    method: "GET",
                    headers,
                    signal,
                });

                if (!response.ok) {
                    console.error("Watch stream failed:", response.statusText);
                    return;
                }

                if (!response.body) return;

                const reader = response.body.getReader();
                const decoder = new TextDecoder();

                let buffer = "";

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split("\n\n");
                    // If the last part didn't end with \n\n, it is incomplete
                    // Wait, split might give empty string if it ends with delimiters

                    // Logic: split by double newline which separates SSE events
                    // If the stream ends in middle of event, we keep buffer

                    // Simple buffer management:
                    // If buffer ends with \n\n, lines will have empty string at end
                    const endsWithSep = buffer.endsWith("\n\n");

                    // if !endsWithSep, the last element of lines is partial
                    if (!endsWithSep && lines.length > 0) {
                        buffer = lines.pop() || "";
                    } else {
                        buffer = "";
                    }

                    for (const line of lines) {
                        if (!line.trim()) continue;
                        const match = line.match(/^data: (.+)$/);
                        if (match) {
                            try {
                                const event = JSON.parse(match[1]);
                                callback(event);
                            } catch (e) {
                                // ignore invalid json or keepalive
                            }
                        }
                    }
                }
            } catch (error: any) {
                if (error.name === 'AbortError') return;
                console.error("Watch stream error:", error);
            }
        })();

        return () => {
            controller.abort();
        };
    }
}
