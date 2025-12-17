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
export declare class FileIO {
    private client;
    private sandboxId;
    constructor(client: Client, sandboxId: string);
    list(path?: string, options?: {
        recursive?: boolean;
    }): Promise<FileItem[]>;
    read(path: string): Promise<string>;
    /**
     * Write single file.
     */
    write(path: string, content: string): Promise<number>;
    /**
     * Write multiple files in parallel.
     * @param files Array of { path, content } objects.
     */
    writeTree(files: {
        path: string;
        content: string;
    }[]): Promise<void>;
    createDir(path: string): Promise<boolean>;
    delete(path: string): Promise<boolean>;
    deleteDir(path: string): Promise<boolean>;
    /**
     * Watch a directory for changes using Server-Sent Events (SSE).
     * @param path Directory path to watch.
     * @param callback Function called with file events.
     * @param options.recursive Whether to watch recursively.
     * @returns unsubscribe function.
     */
    watch(path: string, callback: (event: WatchEvent) => void, options?: {
        recursive?: boolean;
    }): Promise<() => void>;
}
