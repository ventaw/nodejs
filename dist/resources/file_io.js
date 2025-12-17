"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileIO = void 0;
class FileIO {
    constructor(client, sandboxId) {
        this.client = client;
        this.sandboxId = sandboxId;
    }
    async list(path = ".", options) {
        const data = await this.client.request("POST", `/sandboxes/${this.sandboxId}/files/list`, { path, recursive: options === null || options === void 0 ? void 0 : options.recursive });
        return data.items || [];
    }
    async read(path) {
        const data = await this.client.request("POST", `/sandboxes/${this.sandboxId}/files/read`, { path });
        return data.content || "";
    }
    /**
     * Write single file.
     */
    async write(path, content) {
        const data = await this.client.request("POST", `/sandboxes/${this.sandboxId}/files/write`, { path, content });
        return data.bytes_written || 0;
    }
    /**
     * Write multiple files in parallel.
     * @param files Array of { path, content } objects.
     */
    async writeTree(files) {
        await Promise.all(files.map((file) => this.write(file.path, file.content)));
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
    /**
     * Watch a directory for changes using Server-Sent Events (SSE).
     * @param path Directory path to watch.
     * @param callback Function called with file events.
     * @param options.recursive Whether to watch recursively.
     * @returns unsubscribe function.
     */
    async watch(path, callback, options) {
        // Construct URL for streaming endpoint
        const apiBase = this.client.apiBase; // Access private property (or should expose it?)
        // Assuming apiBase usually doesn't end with slash, but let's be safe
        const baseUrl = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
        const url = `${baseUrl}/sandboxes/${this.sandboxId}/files/watch?path=${encodeURIComponent(path)}&recursive=${(options === null || options === void 0 ? void 0 : options.recursive) || false}`;
        const headers = {
            "Content-Type": "application/json",
        };
        const apiKey = this.client.apiKey;
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
                if (!response.body)
                    return;
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = "";
                while (true) {
                    const { done, value } = await reader.read();
                    if (done)
                        break;
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
                    }
                    else {
                        buffer = "";
                    }
                    for (const line of lines) {
                        if (!line.trim())
                            continue;
                        const match = line.match(/^data: (.+)$/);
                        if (match) {
                            try {
                                const event = JSON.parse(match[1]);
                                callback(event);
                            }
                            catch (e) {
                                // ignore invalid json or keepalive
                            }
                        }
                    }
                }
            }
            catch (error) {
                if (error.name === 'AbortError')
                    return;
                console.error("Watch stream error:", error);
            }
        })();
        return () => {
            controller.abort();
        };
    }
}
exports.FileIO = FileIO;
