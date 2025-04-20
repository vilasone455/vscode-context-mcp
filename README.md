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

**Be careful what you ask this server to run!** In Claude Desktop app, use `Approve Once` (not `Allow for This Chat`) so you can review each command, use `Deny` if you don't trust the command. Permissions are dictated by the user that runs the server.

This tool does not yet implement comprehensive security measures, so treat it with caution.

## Integration with AI Assistants

This MCP server is designed to work with Model Context Protocol compatible AI assistants. It enhances their ability to:

- Understand your code context
- Make informed suggestions
- Provide relevant examples
- Help debug issues
- Perform file operations on your behalf

### Using with Claude Desktop

1. Install the VSCode Extension:
   - Download the VSIX package from [here](https://github.com/vilasone455/vscode-context-mcp/releases/latest/download/vscode-context-mcp.vsix)
   - Open VSCode
   - Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS) to open the command palette
   - Type "Extensions: Install from VSIX..." and select the command
   - Navigate to the downloaded VSIX file and select it
   - Restart VSCode after installation
   - For more information about the extension, visit the [VSCode extension repository](https://github.com/vilasone455/vscode-context-mcp-extension)

2. Add the MCP server to your Claude Desktop configuration:
   
   ```json
   {
     "mcpServers": {
       "vscode-context-mpc": {
         "command": "node",
         "args": [
           "C:\\Projects\\vscode-context-mcp\\dist\\index.js"
         ]
       }
     }
   }
   ```

   **Note:** Make sure to update the path to match your actual project location.

3. Example prompt to test the connection:
   
   Once you have everything set up, you can test if Claude can access your VSCode context with a prompt like:
   
   ```
   Please check my current VSCode project and tell me what files I have open.
   ```

4. How to add files to context:
   
   To add specific files to your conversation context with Claude:
   - Press `Ctrl+L` (Windows/Linux) or `Cmd+L` (macOS) to add the current file to Claude context
   - Press `Ctrl+I` (Windows/Linux) or `Cmd+I` (macOS) to add the selected text to Claude context
   - You can also use the VSCode Command Palette (`Ctrl+Shift+P`) and search for "Add File to Context" or ">Add Selection to Context"

## Tool Reference

| Tool Name | Description |
|-----------|-------------|
| `get_vscode_context` | Retrieve complete VSCode context information |
| `get_attached_files` | Retrieve a list of files attached to the VS Code workspace |
| `get_project_path` | Get current project root directory |
| `get_current_file` | Get details and content of the active file |
| `get_open_tabs` | List all open editor tabs |
| `get_problems` | Retrieve diagnostics (errors/warnings) |
| `get_terminal_content` | Get terminal output and history |
| `run_command` | Execute a shell command |
| `read_file` | Read contents of a file |
| `read_multiple_files` | Read multiple files at once |
| `write_file` | Create or overwrite a file |
| `edit_file` | Make line-based edits to a file |
| `create_directory` | Create directory structure |
| `list_directory` | List files and directories |
| `directory_tree` | Get recursive directory structure |
| `move_file` | Move or rename files and directories |
| `search_files` | Find files matching a pattern |
| `get_file_info` | Get detailed file metadata |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.