import { ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { z } from "zod";
import * as schemas from "../schemas/index.js";
import * as fileTools from "./fileTools.js";
import * as vsCodeTools from "./vscodeTool.js";


const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

/**
 * Get the list of available tools with their schemas
 */
export function getToolsList() {
  return [
    {
      name: "get_vscode_context",
      description:
        "Retrieve the current development context from a VSCode project. " +
        "This includes the active project path, the currently open file, and all open editor tabs. " +
        "Use this tool only when the topic involves software development to gather project-specific insights " +
        "from the VSCode environment.",
      inputSchema: zodToJsonSchema(schemas.InitChatArgsSchema) as ToolInput,
    },
    {
      name: "read_file",
      description:
        "Read the complete contents of a file from the file system. " +
        "Handles various text encodings and provides detailed error messages " +
        "if the file cannot be read. Use this tool when you need to examine " +
        "the contents of a single file. Only works within allowed directories.",
      inputSchema: zodToJsonSchema(schemas.ReadFileArgsSchema) as ToolInput,
    },
    {
      name: "read_multiple_files",
      description:
        "Read the contents of multiple files simultaneously. This is more " +
        "efficient than reading files one by one when you need to analyze " +
        "or compare multiple files. Each file's content is returned with its " +
        "path as a reference. Failed reads for individual files won't stop " +
        "the entire operation. Only works within allowed directories.",
      inputSchema: zodToJsonSchema(schemas.ReadMultipleFilesArgsSchema) as ToolInput,
    },
    {
      name: "write_file",
      description:
        "Create a new file or completely overwrite an existing file with new content. " +
        "Use with caution as it will overwrite existing files without warning. " +
        "Handles text content with proper encoding. Only works within allowed directories.",
      inputSchema: zodToJsonSchema(schemas.WriteFileArgsSchema) as ToolInput,
    },
    {
      name: "edit_file",
      description:
        "Make line-based edits to a text file. Each edit replaces exact line sequences " +
        "with new content. Returns a git-style diff showing the changes made. " +
        "Only works within allowed directories.",
      inputSchema: zodToJsonSchema(schemas.EditFileArgsSchema) as ToolInput,
    },
    {
      name: "create_directory",
      description:
        "Create a new directory or ensure a directory exists. Can create multiple " +
        "nested directories in one operation. If the directory already exists, " +
        "this operation will succeed silently. Perfect for setting up directory " +
        "structures for projects or ensuring required paths exist. Only works within allowed directories.",
      inputSchema: zodToJsonSchema(schemas.CreateDirectoryArgsSchema) as ToolInput,
    },
    {
      name: "list_directory",
      description:
        "Get a detailed listing of all files and directories in a specified path. " +
        "Results clearly distinguish between files and directories with [FILE] and [DIR] " +
        "prefixes. This tool is essential for understanding directory structure and " +
        "finding specific files within a directory. Only works within allowed directories.",
      inputSchema: zodToJsonSchema(schemas.ListDirectoryArgsSchema) as ToolInput,
    },
    {
      name: "directory_tree",
      description:
        "Get a recursive tree view of files and directories as a JSON structure. " +
        "Each entry includes 'name', 'type' (file/directory), and 'children' for directories. " +
        "Files have no children array, while directories always have a children array (which may be empty). " +
        "The output is formatted with 2-space indentation for readability. Only works within allowed directories.",
      inputSchema: zodToJsonSchema(schemas.DirectoryTreeArgsSchema) as ToolInput,
    },
    {
      name: "move_file",
      description:
        "Move or rename files and directories. Can move files between directories " +
        "and rename them in a single operation. If the destination exists, the " +
        "operation will fail. Works across different directories and can be used " +
        "for simple renaming within the same directory. Both source and destination must be within allowed directories.",
      inputSchema: zodToJsonSchema(schemas.MoveFileArgsSchema) as ToolInput,
    },
    {
      name: "search_files",
      description:
        "Recursively search for files and directories matching a pattern. " +
        "Searches through all subdirectories from the starting path. The search " +
        "is case-insensitive and matches partial names. Returns full paths to all " +
        "matching items. Great for finding files when you don't know their exact location. " +
        "Only searches within allowed directories.",
      inputSchema: zodToJsonSchema(schemas.SearchFilesArgsSchema) as ToolInput,
    },
    {
      name: "get_file_info",
      description:
        "Retrieve detailed metadata about a file or directory. Returns comprehensive " +
        "information including size, creation time, last modified time, permissions, " +
        "and type. This tool is perfect for understanding file characteristics " +
        "without reading the actual content. Only works within allowed directories.",
      inputSchema: zodToJsonSchema(schemas.GetFileInfoArgsSchema) as ToolInput,
    }
  ];
}

/**
 * Handle tool calls
 */
export async function handleToolCall(name: string, args: any) {
  try {
    switch (name) {
      case "read_file": {
        const parsed = schemas.ReadFileArgsSchema.safeParse(args);
        if (!parsed.success) {
          throw new Error(`Invalid arguments for read_file: ${parsed.error}`);
        }
        const content = await fileTools.readFile(parsed.data.path);
        return { content: [{ type: "text", text: content }] };
      }

      case "read_multiple_files": {
        const parsed = schemas.ReadMultipleFilesArgsSchema.safeParse(args);
        if (!parsed.success) {
          throw new Error(`Invalid arguments for read_multiple_files: ${parsed.error}`);
        }
        const content = await fileTools.readMultipleFiles(parsed.data.paths);
        return { content: [{ type: "text", text: content }] };
      }

      case "write_file": {
        const parsed = schemas.WriteFileArgsSchema.safeParse(args);
        if (!parsed.success) {
          throw new Error(`Invalid arguments for write_file: ${parsed.error}`);
        }
        const message = await fileTools.writeFile(parsed.data.path, parsed.data.content);
        return { content: [{ type: "text", text: message }] };
      }

      case "edit_file": {
        const parsed = schemas.EditFileArgsSchema.safeParse(args);
        if (!parsed.success) {
          throw new Error(`Invalid arguments for edit_file: ${parsed.error}`);
        }
        const result = await fileTools.editFile(parsed.data.path, parsed.data.edits, parsed.data.dryRun);
        return { content: [{ type: "text", text: result }] };
      }

      case "create_directory": {
        const parsed = schemas.CreateDirectoryArgsSchema.safeParse(args);
        if (!parsed.success) {
          throw new Error(`Invalid arguments for create_directory: ${parsed.error}`);
        }
        const message = await fileTools.createDirectory(parsed.data.path);
        return { content: [{ type: "text", text: message }] };
      }

      case "list_directory": {
        const parsed = schemas.ListDirectoryArgsSchema.safeParse(args);
        if (!parsed.success) {
          throw new Error(`Invalid arguments for list_directory: ${parsed.error}`);
        }
        const formatted = await fileTools.listDirectory(parsed.data.path);
        return { content: [{ type: "text", text: formatted }] };
      }

      case "directory_tree": {
        const parsed = schemas.DirectoryTreeArgsSchema.safeParse(args);
        if (!parsed.success) {
          throw new Error(`Invalid arguments for directory_tree: ${parsed.error}`);
        }
        const treeJson = await fileTools.directoryTree(parsed.data.path);
        return { content: [{ type: "text", text: treeJson }] };
      }

      case "move_file": {
        const parsed = schemas.MoveFileArgsSchema.safeParse(args);
        if (!parsed.success) {
          throw new Error(`Invalid arguments for move_file: ${parsed.error}`);
        }
        const message = await fileTools.moveFile(parsed.data.source, parsed.data.destination);
        return { content: [{ type: "text", text: message }] };
      }

      case "search_files": {
        const parsed = schemas.SearchFilesArgsSchema.safeParse(args);
        if (!parsed.success) {
          throw new Error(`Invalid arguments for search_files: ${parsed.error}`);
        }
        const results = await fileTools.searchFiles(parsed.data.path, parsed.data.pattern, parsed.data.excludePatterns);
        return { content: [{ type: "text", text: results }] };
      }

      case "get_file_info": {
        const parsed = schemas.GetFileInfoArgsSchema.safeParse(args);
        if (!parsed.success) {
          throw new Error(`Invalid arguments for get_file_info: ${parsed.error}`);
        }
        const info = await fileTools.getFileInfo(parsed.data.path);
        return { content: [{ type: "text", text: info }] };
      }



      case "get_vscode_context": {
        const context = await vsCodeTools.getVsCodeSession();
        return {
          content: [{ type: "text", text: JSON.stringify(context, null, 2) }],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: "text", text: `Error: ${errorMessage}` }],
      isError: true,
    };
  }
}