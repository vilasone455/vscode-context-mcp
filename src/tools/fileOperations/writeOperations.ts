import fs from "fs/promises";
import { validatePath } from "../../security/pathValidation.js";
import { applyFileEdits } from "../../utils/fileUtils.js";

/**
 * Write to a file
 */
export async function writeFile(filePath: string, content: string): Promise<string> {
  const validPath = await validatePath(filePath);
  await fs.writeFile(validPath, content, "utf-8");
  return `Successfully wrote to ${filePath}`;
}

/**
 * Edit a file with multiple edits
 */
export async function editFile(
  filePath: string, 
  edits: { oldText: string; newText: string }[], 
  dryRun: boolean
): Promise<string> {
  const validPath = await validatePath(filePath);
  return await applyFileEdits(validPath, edits, dryRun);
}

/**
 * Move or rename a file
 */
export async function moveFile(sourcePath: string, destinationPath: string): Promise<string> {
  const validSourcePath = await validatePath(sourcePath);
  const validDestPath = await validatePath(destinationPath);
  await fs.rename(validSourcePath, validDestPath);
  return `Successfully moved ${sourcePath} to ${destinationPath}`;
}