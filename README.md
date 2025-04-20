# VSCode Context MCP

A Model Context Protocol (MCP) server that provides VSCode context and filesystem operations for AI assistants.

## Overview

VSCode Context MCP creates a bridge between AI assistants and your VSCode environment. It enables AI models to:

1. Access the current VSCode context (active files, tabs, terminal output)
2. Perform filesystem operations with controls
3. Execute shell commands in a controlled environment

This allows AI assistants to provide more relevant and context-aware help for software development tasks.

## Features

### VSCode Context Access
- Get current project path
- Retrieve active file contents and metadata
- List open editor tabs
- Access diagnostic problems (warnings/errors)
- Retrieve terminal output
- Access files attached to the workspace

### Filesystem Operations
- Read/write files
- Edit files with line-based changes
- Create directories
- List directory contents
- Generate directory trees
- Search for files
- Get file metadata
- Move/rename files

### Command Execution
- Run shell commands with output capture
- Controlled execution environment

## ⚠️ Security Warning

**Be careful what you ask this server to run!** In the Claude Desktop app, use `Approve Once` (not `Allow for This Chat`) so you can review each command, and use `Deny` if you don't trust the command. Permissions are dictated by the user running the server.

This tool does not yet implement comprehensive security measures, so treat it with caution.

## Integration with AI Assistants

This MCP server is designed to work with Model Context Protocol-compatible AI assistants. It enhances their ability to:

- Understand your code context
- Make informed suggestions
- Provide relevant examples
- Help debug issues
- Perform file operations on your behalf

### 1. Install the VSCode Extension

- Download the VSIX package from [here](https://github.com/vilasone455/vscode-context-mcp-extension/releases/download/1.0.1/vscode-context-mcp-extension-1.0.1.vsix)
- Open VSCode
- Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS) to open the command palette
- Type **"Extensions: Install from VSIX..."** and select it
- Navigate to the downloaded VSIX file and select it
- Restart VSCode after installation

For more information, visit the [VSCode extension repository](https://github.com/vilasone455/vscode-context-mcp-extension)

### 2. Set Up and Run the MCP Server

First, clone or download this repository. Then, install the dependencies and build the project:

```bash
cd path/to/vscode-context-mcp
npm install
npm run build
```

Once built, update your **Claude Desktop** configuration to use the MCP server:

```json
{
  "mcpServers": {
    "vscode-context-mpc": {
      "command": "node",
      "args": [
        "C:\\path\\to\\vscode-context-mcp\\dist\\index.js"
      ]
    }
  }
}
```

> **Note:** Make sure the file path in the `args` array matches your actual project location.

### 3. Test the Connection

To verify that everything is working correctly, try using this prompt in Claude:

```
Please check my current VSCode project and tell me what files I have open.
```

### 4. Add Files to Claude Context

You can add files to your Claude context in a few ways:

- Press `Ctrl+L` (Windows/Linux) or `Cmd+L` (macOS) to add the current file
- Press `Ctrl+I` or `Cmd+I` to add only the selected text
- Open the command palette (`Ctrl+Shift+P` or `Cmd+Shift+P`) and search for:
  - **"Add File to Context"**
  - **"Add Selection to Context"**

## Tool Reference

| Tool Name            | Description                                  |
|----------------------|----------------------------------------------|
| `get_vscode_context` | Retrieve complete VSCode context information |
| `get_attached_files` | Retrieve a list of files attached to the workspace |
| `get_project_path`   | Get current project root directory           |
| `get_current_file`   | Get details and content of the active file   |
| `get_open_tabs`      | List all open editor tabs                    |
| `get_problems`       | Retrieve diagnostics (errors/warnings)       |
| `get_terminal_content` | Get terminal output and history           |
| `run_command`        | Execute a shell command                      |
| `read_file`          | Read contents of a file                      |
| `read_multiple_files`| Read multiple files at once                  |
| `write_file`         | Create or overwrite a file                   |
| `edit_file`          | Make line-based edits to a file              |
| `create_directory`   | Create directory structure                   |
| `list_directory`     | List files and directories                   |
| `directory_tree`     | Get recursive directory structure            |
| `move_file`          | Move or rename files and directories         |
| `search_files`       | Find files matching a pattern                |
| `get_file_info`      | Get detailed file metadata                   |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License – see the [LICENSE](./LICENSE) file for details.

