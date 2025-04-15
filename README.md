# VS Code Context MCP Server

A secure Model Context Protocol (MCP) server for connecting to VS Code and accessing the filesystem within designated allowed directories.

## Overview

This project implements a secure filesystem access server using the Model Context Protocol (MCP). It allows tools and models to access the filesystem in a controlled manner, limiting access to explicitly allowed directories.

## Features

- Secure filesystem access with directory restrictions
- Support for reading, writing, and editing files
- Directory operations (listing, creating, tree view)
- File search capabilities
- Secure path validation to prevent directory traversal attacks
- Support for file diffing and editing

## Installation

```bash
npm install
npm run build
```

## Usage

```bash
# Run the server with allowed directories
node dist/index.js /path/to/allowed/directory [/another/allowed/directory]
```

Or use it as a library:

```javascript
import { initializeServer } from 'vscode-context-mcp';

const server = await initializeServer(['/path/to/allowed/directory']);
// Use the server...
```

## Available Tools

The server provides the following tools:

- `read_file`: Read the contents of a file
- `read_multiple_files`: Read the contents of multiple files
- `write_file`: Create or overwrite a file
- `edit_file`: Make line-based edits to a text file
- `create_directory`: Create a directory structure
- `list_directory`: List files in a directory
- `directory_tree`: Get a recursive view of files and directories
- `move_file`: Move or rename files and directories
- `search_files`: Find files matching a pattern
- `get_file_info`: Get file metadata
- `list_allowed_directories`: List the accessible directories

## Security

This server implements several security features:

- Path validation to prevent directory traversal attacks
- Symlink resolution to prevent escaping allowed directories
- Parent directory validation for new files

## License

MIT