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
    read(path: string, options?: {
        encoding?: "utf-8" | "base64";
    }): Promise<string>;
    write(path: string, content: string, options?: {
        encoding?: "utf-8" | "base64";
    }): Promise<void>;
    createDir(path: string): Promise<boolean>;
    createDirectory(path: string): Promise<boolean>;
    delete(path: string, options?: {
        recursive?: boolean;
    }): Promise<boolean>;
    deleteFile(path: string): Promise<boolean>;
    deleteDirectory(path: string): Promise<boolean>;
    batchWrite(files: Record<string, string>, createDirs?: boolean): Promise<any>;
}
