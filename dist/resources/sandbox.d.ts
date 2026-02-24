import { FileIO } from "./file_io";
import { SecretIO } from "./secret_io";
export interface SandboxData {
    id: string;
    name?: string;
    template_id?: string;
    state?: string;
    ip_address?: string;
    access_url?: string;
    created_at?: string;
    internet_enabled?: boolean;
    egress_profile?: string;
}
export interface ExecuteOptions {
    timeout?: number;
}
export interface DiffFile {
    path: string;
    status: string;
    additions: number;
    deletions: number;
    patch: string;
    old_path?: string;
}
export interface DiffStats {
    additions: number;
    deletions: number;
    files_changed: number;
}
export interface DiffResult {
    files: DiffFile[];
    stats: DiffStats;
}
export interface FileStatusEntry {
    path: string;
    status: string;
    staged: boolean;
}
export interface GitStatusResponse {
    files: FileStatusEntry[];
}
export interface CommitInfo {
    sha: string;
    message: string;
    author: string;
    date: string;
    files?: string[];
}
export interface GitLogResponse {
    commits: CommitInfo[];
}
export interface BlameLine {
    line: number;
    sha: string;
    author: string;
    date: string;
    content: string;
}
export interface GitBlameResponse {
    lines: BlameLine[];
}
export declare class Sandbox {
    id: string;
    name?: string;
    template_id?: string;
    state?: string;
    ip_address?: string;
    access_url?: string;
    created_at?: string;
    internet_enabled?: boolean;
    egress_profile?: string;
    private _client;
    constructor(data: SandboxData);
    get files(): FileIO;
    static get secrets(): SecretIO;
    static create(template: string, name: string, vcpu?: number, memory?: number, internet_enabled?: boolean, egress_profile?: string): Promise<Sandbox>;
    static get(id: string): Promise<Sandbox>;
    static list(): Promise<Sandbox[]>;
    delete(): Promise<boolean>;
    refresh(): Promise<void>;
    private _mcpPost;
    start(useMcp?: boolean): Promise<void>;
    pause(useMcp?: boolean): Promise<void>;
    terminate(useMcp?: boolean): Promise<void>;
    createSshToken(ttlMinutes?: number): Promise<any>;
    listSshTokens(): Promise<any>;
    revokeSshToken(token: string): Promise<void>;
    execute(code: string, language?: string, optionsOrMcp?: ExecuteOptions | boolean): Promise<any>;
    createPty(command?: string, cwd?: string, cols?: number, rows?: number): Promise<any>;
    sendPtyInput(ptyId: string, data: string): Promise<any>;
    resizePty(ptyId: string, cols: number, rows: number): Promise<any>;
    getPtyLogs(ptyId: string, offset?: number): Promise<any>;
    deletePty(ptyId: string): Promise<any>;
    listSessions(): Promise<any>;
    createSession(command: string, cwd?: string, name?: string): Promise<any>;
    getSessionLogs(sessionId: string, offset?: number): Promise<any>;
    deleteSession(sessionId: string): Promise<any>;
    get filesClient(): FileIO;
    listFiles(path?: string, recursive?: boolean): Promise<import("./file_io").FileItem[]>;
    readFile(path: string, encoding?: "utf-8" | "base64", useMcp?: boolean): Promise<any>;
    writeFile(path: string, content: string, encoding?: "utf-8" | "base64", useMcp?: boolean): Promise<true | void>;
    createDir(path: string): Promise<boolean>;
    deleteFileOrDir(path: string, recursive?: boolean): Promise<boolean>;
    getMetrics(limit?: number): Promise<any[]>;
    getMetricsSummary(): Promise<any>;
    getLogs(limit?: number): Promise<any[]>;
    update(options: {
        name?: string;
        startupCommand?: string;
        internetEnabled?: boolean;
        egressProfile?: string;
        vpcId?: string;
        defaultPort?: number;
    }): Promise<boolean>;
    gitClone(repoUrl: string, targetDir: string): Promise<any>;
    gitStatus(): Promise<any>;
    gitPull(): Promise<any>;
    gitDiff(options?: {
        path?: string;
        staged?: boolean;
    }): Promise<DiffResult>;
    gitStatusStructured(): Promise<GitStatusResponse>;
    gitDiffBranches(base: string, compare?: string, path?: string): Promise<DiffResult>;
    gitLogStructured(options?: {
        limit?: number;
        branch?: string;
    }): Promise<GitLogResponse>;
    gitBlame(file: string, startLine?: number, endLine?: number): Promise<GitBlameResponse>;
    grep(pattern: string, path?: string, recursive?: boolean): Promise<any>;
    getFileTree(path?: string): Promise<any>;
    codeStructure(): Promise<any>;
    codeSymbols(file: string): Promise<any>;
    codeSymbolSearch(query: string): Promise<any>;
    codeImplementation(symbol: string, file: string): Promise<any>;
    codeCallers(symbol: string, file: string): Promise<any>;
    codePeek(file: string, startLine: number, endLine: number): Promise<any>;
    codeGrep(pattern: string, path?: string): Promise<any>;
}
