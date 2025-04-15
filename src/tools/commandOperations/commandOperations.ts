import { exec } from "child_process";
import { promisify } from "util";
import { validatePath } from "../../security/pathValidation.js";

// Promisify exec for async/await usage
const execAsync = promisify(exec);

/**
 * Interface for command execution results
 */
export interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
}

/**
 * Execute a shell command in a specified working directory
 * @param command The command to execute
 * @param workingDir Working directory path (will be validated)
 * @returns CommandResult with stdout, stderr, and exit code
 */
export async function runCommand(command: string, workingDir: string): Promise<CommandResult> {
  try {
    // Validate the working directory
    const cwd = await validatePath(workingDir);
    
    // Execute the command
    const { stdout, stderr } = await execAsync(command, { cwd });
    
    return {
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      exitCode: 0
    };
  } catch (error: any) {
    // Handle execution errors
    if (error.stdout || error.stderr) {
      // Command executed but returned non-zero exit code
      return {
        stdout: error.stdout?.trim() || "",
        stderr: error.stderr?.trim() || "",
        exitCode: error.code || 1
      };
    } else {
      // Failed to execute the command
      return {
        stdout: "",
        stderr: error.message || String(error),
        exitCode: error.code || 1
      };
    }
  }
}
