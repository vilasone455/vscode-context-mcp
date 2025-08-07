import fs from "fs/promises";
import axios from "axios";
import { validatePath } from "../../security/pathValidation.js";
// import { applyFileEdits } from "../../utils/fileUtils.js";
import { PORT } from "../../utils/common.js";

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
// export async function editFile(
//   filePath: string, 
//   edits: { oldText: string; newText: string }[], 
//   dryRun: boolean
// ): Promise<string> {
//   const validPath = await validatePath(filePath);
//   return await applyFileEdits(validPath, edits, dryRun);
// }

/**
 * Move or rename a file
 */
export async function moveFile(sourcePath: string, destinationPath: string): Promise<string> {
  const validSourcePath = await validatePath(sourcePath);
  const validDestPath = await validatePath(destinationPath);
  await fs.rename(validSourcePath, validDestPath);
  return `Successfully moved ${sourcePath} to ${destinationPath}`;
}

/**
 * Edit a file by line numbers (communicates with VSCode extension for token efficiency)
 */
export async function editFileByLines(
  filePath: string,
  edits: any[]
): Promise<string> {

  try {
    // Validate path for security
    await validatePath(filePath);

    const port = PORT;

    const res = await axios.post(`http://localhost:${port}/modify-file`, {
      filePath,
      edits
    });

    return `Successfully edited ${edits.length} section(s) in ${filePath}`;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const serverMessage = error.response?.data?.error || 'No detailed server error message.';
      console.error('❌ Axios error:', serverMessage);
      return `Error editing file: ${serverMessage}`;
    } else {
      console.error('🐛 Unexpected error:', error.message);
      return `Error editing file: ${error.message}`;
    }
  }
}