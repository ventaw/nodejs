import { Client } from "../client";
export interface FileItem {
    name: string;
    path: string;
    size: number;
    type: "file" | "directory";
}
export declare class FileIO {
    private client;
    private sandboxId;
    constructor(client: Client, sandboxId: string);
    list(path?: string): Promise<FileItem[]>;
    read(path: string): Promise<string>;
    write(path: string, content: string): Promise<number>;
    createDir(path: string): Promise<boolean>;
    delete(path: string): Promise<boolean>;
    deleteDir(path: string): Promise<boolean>;
}
