# Ventaw JS/TS SDK

The official JavaScript/TypeScript SDK for managing Ventaw sandboxes.

## Installation

```bash
npm install ventaw-sdk
# OR for local development
npm install ./path/to/ventaw/sdk/js
```

## Configuration

You can configure the SDK using the global config object or by instantiating the `Client` class.

```typescript
import { config, Client } from "ventaw-sdk";

// Global configuration
config.apiKey = "your-api-key";
// config.apiBase = "https://ventaw.mmogomedia.com/v1"; // Default value

// Per-instance configuration
const client = new Client({
  apiKey: "your-api-key"
  // baseUrl is optional, defaults to https://ventaw.mmogomedia.com/v1
});
```

## Usage

### Managing Templates

List available templates to use for creating sandboxes.

```typescript
import { Template } from "ventaw-sdk";

const templates = await Template.list();
templates.forEach(t => {
  console.log(`${t.name} (${t.code})`);
});
```

### Managing Sandboxes

Create, list, and manage sandboxes.

```typescript
import { Sandbox } from "ventaw-sdk";

// Create a new sandbox
const sandbox = await Sandbox.create("nextjs", "my-sandbox");
console.log(`Created sandbox: ${sandbox.id}`);

// Wait for it to start
while (sandbox.state !== "running") {
  await new Promise(r => setTimeout(r, 1000));
  await sandbox.refresh();
}

console.log(`Sandbox running at: ${sandbox.access_url}`);

// List all sandboxes
const allSandboxes = await Sandbox.list();
allSandboxes.forEach(sb => console.log(sb.id));

// Delete a sandbox
await sandbox.delete();
```

### File Operations

Interact with files inside the sandbox.

```typescript
// Create a directory
await sandbox.files.createDir("/app/data");

// Write a file
await sandbox.files.write("/app/data/config.json", '{"env": "dev"}');

// Read a file
const content = await sandbox.files.read("/app/data/config.json");
console.log(content);

// List files
const files = await sandbox.files.list("/app");
files.forEach(file => {
  console.log(`${file.name} - ${file.type}`);
});

// Delete a file
await sandbox.files.delete("/app/data/config.json");
```

## Error Handling

The SDK throws custom error types that you can catch and handle.

```typescript
import { APIError, AuthenticationError, APIConnectionError } from "ventaw-sdk";

try {
  await sandbox.files.read("non-existent-file");
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error("Invalid API Key");
  } else if (error instanceof APIError) {
    console.error(`API Error (${error.statusCode}): ${error.message}`);
  } else if (error instanceof APIConnectionError) {
    console.error("Network invalid or Ventaw is down");
  }
}
```

### Common Failure Modes

- **AuthenticationError (401)**: The API key provided is invalid or missing. Check `config.apiKey`.
- **APIError (4xx/5xx)**: The API request returned a failure. 
  - `404`: Resource (sandbox, file, template) not found.
  - `400`: Bad request (e.g., invalid parameters).
  - `500`: Internal server error.
- **APIConnectionError**: Could not connect to the API server (network down, timeout, or DNS issue).

