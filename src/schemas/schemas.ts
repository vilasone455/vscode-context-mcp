import { z } from "zod";

export const InitChatArgsSchema = z.object({
});

// Command tools schema
export const RunCommandArgsSchema = z.object({
  command: z.string().describe('Command to execute in the shell'),
  workingDir: z.string().describe('Working directory for command execution')
});

// VSCode tools schemas
export const ProjectPathArgsSchema = z.object({});
export const CurrentFileArgsSchema = z.object({});
export const OpenTabsArgsSchema = z.object({});
export const ProblemsArgsSchema = z.object({});
export const TerminalContentArgsSchema = z.object({});
export const AttachedFilesArgsSchema = z.object({});

export const ReadFileArgsSchema = z.object({
  path: z.string(),
  showLineNumbers: z.boolean().optional().default(false).describe('Show line numbers for easier line-based editing')
});

export const ReadMultipleFilesArgsSchema = z.object({
  paths: z.array(z.string()),
});

export const WriteFileArgsSchema = z.object({
  path: z.string(),
  content: z.string(),
});


const MatchByLinesSchema = z.object({
  match_type: z.literal("lines"),
  startLine: z.number().int().positive().describe("The 1-indexed starting line number of the range."),
  endLine: z.number().int().positive().describe("The 1-indexed ending line number of the range."),
});

const MatchByLineSchema = z.object({
  match_type: z.literal("line"),
  atLine: z.number().int().positive().describe("The 1-indexed line number to target."),
});

const MatchByRegexSchema = z.object({
  match_type: z.literal("regex"),
  regex: z.string().describe("A JavaScript-compatible Regex pattern to find in the file. Remember to escape backslashes in JSON strings (e.g., '\\\\d+')."),
  occurrence: z.number().int().positive().optional().default(1).describe("Which occurrence of the regex pattern to target (1-based)."),
});

const MatchByStrSchema = z.object({
  match_type: z.literal("str"),
  text: z.string().describe("The exact string literal to find in the file."),
  occurrence: z.number().int().positive().optional().default(1).describe("Which occurrence of the string to target (1-based)."),
});

const MatchByWholeFileSchema = z.object({
    match_type: z.literal("whole_file"),
}).describe("Targets the entire content of the file.");

// ===== NEW: AST Match Schema =====
const ASTNodeTypeSchema = z.enum([
  "function",
  "class",
  "method",
  "property",
  "interface",
  "type",
  "enum",
  "variable",
  "trait",
]).describe("The type of Abstract Syntax Tree (AST) node to target.");

const MatchByASTSchema = z.object({
  match_type: z.literal("ast"),
  nodeType: ASTNodeTypeSchema,
  name: z.string().describe("The name of the AST node (e.g., the function name, class name)."),
  depth: z.number().int().min(0).optional().describe("The nesting depth of the node. 0 for top-level, 1 for a class member, etc. Use the 'list_ast_nodes' tool to find this value."),
  parent: z.string().optional().describe("The name of the parent node (e.g., the class name for a method). Use the 'list_ast_nodes' tool to find this."),
  occurrence: z.number().int().positive().optional().default(1).describe("Which occurrence of the matching node to target (1-based), if multiple nodes have the same type, name, depth, and parent."),
}).describe("Targets a specific code structure (like a function or class) using the Abstract Syntax Tree (AST).");


// =================================================================
// 2. DEFINE THE FINAL, COMBINED EDIT SCHEMA
// This combines actions with their allowed targets into a single union.
// =================================================================

export const ApiEditSchema = z.union([
  // --- REPLACE ACTION ---
  // Can target lines, regex, string, whole file, or AST node.
  z.object({
    action_type: z.literal("replace"),
    newText: z.string().describe("The new text that will replace the targeted content."),
  }).and(z.union([MatchByLinesSchema, MatchByRegexSchema, MatchByStrSchema, MatchByWholeFileSchema, MatchByASTSchema])),

  // --- INSERT-BEFORE & INSERT-AFTER ACTIONS ---
  // Can target a line, regex, string match, or AST node.
  z.object({
    action_type: z.union([z.literal("insert-before"), z.literal("insert-after")]),
    newText: z.string().describe("The new text to insert. For 'line' matches, this will be on a new line. For other matches, it's inserted directly."),
  }).and(z.union([MatchByLineSchema, MatchByRegexSchema, MatchByStrSchema, MatchByASTSchema])),

  // --- PREPEND & APPEND ACTIONS ---
  // Can only target a single, specific line.
  z.object({
    action_type: z.union([z.literal("prepend"), z.literal("append")]),
    newText: z.string().describe("The text to add to the beginning (prepend) or end (append) of the target line."),
  }).and(MatchByLineSchema),

  // --- DELETE ACTION ---
  // Can target lines, regex, string, whole file, or AST node. Does not need `newText`.
  z.object({
    action_type: z.literal("delete"),
  }).and(z.union([MatchByLinesSchema, MatchByRegexSchema, MatchByStrSchema, MatchByWholeFileSchema, MatchByASTSchema])),
]).describe("A single, structured instruction for editing a file. It combines an `action_type` (what to do) with a `match_type` (where to do it).");

// --- The Main Arguments Schema for the New Tool ---

export const ApplyFileEditsArgsSchema = z.object({
  filePath: z.string().describe("The absolute or relative path to the file to be edited."),
  shortComment: z.string().describe("A short, one-sentence, imperative-mood git commit style message for this change. E.g., 'Refactor database connection logic'."),
  edits: z.array(ApiEditSchema).describe("An array of edit operations to apply to the file."),
});


export const CreateDirectoryArgsSchema = z.object({
  path: z.string(),
});

export const ListDirectoryArgsSchema = z.object({
  path: z.string(),
});

export const DirectoryTreeArgsSchema = z.object({
  path: z.string(),
  ignoreFolders: z.array(z.string()).optional().default([]).describe('Array of folder paths to ignore (supports wildcards)')
});

export const MoveFileArgsSchema = z.object({
  source: z.string(),
  destination: z.string(),
});

export const SearchFilesArgsSchema = z.object({
  path: z.string(),
  pattern: z.string(),
  excludePatterns: z.array(z.string()).optional().default([]),
  ignoreFolders: z.array(z.string()).optional().default([]).describe('Array of folder paths to ignore (supports wildcards)')
});

export const GetFileInfoArgsSchema = z.object({
  path: z.string(),
});

// Type for a file info object
export interface FileInfo {
  size: number;
  created: Date;
  modified: Date;
  accessed: Date;
  isDirectory: boolean;
  isFile: boolean;
  permissions: string;
}

// Type for optimized flattened directory tree
export interface FlatTreeData {
  d: string[];  // directories (with trailing /)
  f: string[];  // files (with full paths)
}