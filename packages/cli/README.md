# Nimbus CLI

A command-line interface for managing your Nimbus files.

## Installation

```bash
# From the root of the monorepo
bun install
cd packages/cli
bun run build
bun link
```

## Usage

### Authentication

Before using the CLI, you need to authenticate:

```bash
nimbus login
```

This will open your browser for authentication. Once authenticated, you can use other commands.

### Commands

#### List Files

```bash
# List files in root directory
nimbus ls

# List files in specific directory
nimbus ls -p /documents
```

#### Upload Files

```bash
# Upload a file to root directory
nimbus upload ./myfile.txt

# Upload a file to specific directory
nimbus upload ./myfile.txt -d /documents
```

#### Download Files

```bash
# Download a file (saves with same name)
nimbus download /documents/myfile.txt

# Download a file with custom output name
nimbus download /documents/myfile.txt -o ./downloaded.txt
```

#### Delete Files

```bash
# Delete a file
nimbus rm /documents/myfile.txt
```

## Development

```bash
# Watch mode
bun run dev

# Build
bun run build

# Run locally
bun run start
```
