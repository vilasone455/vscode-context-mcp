import fs from "fs/promises";
import { validatePath } from "../../security/pathValidation.js";

/**
 * Read a single file
 */
export async function readFile(filePath: string): Promise<string> {
  const validPath = await validatePath(filePath);
  return await fs.readFile(validPath, "utf-8");
}

/**
 * Read multiple files
 */
export async function readMultipleFiles(filePaths: string[]): Promise<string> {
  const results = await Promise.all(
    filePaths.map(async (filePath: string) => {
      try {
        const validPath = await validatePath(filePath);
        const content = await fs.readFile(validPath, "utf-8");
        return `${filePath}:\n${content}\n`;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return `${filePath}: Error - ${errorMessage}`;
      }
    }),
  );
  return results.join("\n---\n");
}

/**
 * Get detailed file information
 */
export async function getFileInfo(filePath: string): Promise<string> {
  const validPath = await validatePath(filePath);
  const info = await getFileStats(validPath);
  return Object.entries(info)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
}

/**
 * Get detailed stats for a file
 */
async function getFileStats(filePath: string): Promise<{
  size: number;
  created: Date;
  modified: Date;
  accessed: Date;
  isDirectory: boolean;
  isFile: boolean;
  permissions: string;
}> {
  const stats = await fs.stat(filePath);
  return {
    size: stats.size,
    created: stats.birthtime,
    modified: stats.mtime,
    accessed: stats.atime,
    isDirectory: stats.isDirectory(),
    isFile: stats.isFile(),
    permissions: stats.mode.toString(8).slice(-3),
  };
}