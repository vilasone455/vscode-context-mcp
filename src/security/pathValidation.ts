import fs from "fs/promises";
import path from "path";
import os from 'os';

// Store disallowed directories
let disallowedDirectories: string[] = [];

/**
 * Initialize disallowed directories
 */
export function initializeDisallowedDirectories(directories: string[]): void {
  disallowedDirectories = directories.map(dir =>
    normalizePath(path.resolve(expandHome(dir)))
  );
}

/**
 * Get the list of disallowed directories
 */
export function getDisallowedDirectories(): string[] {
  return [...disallowedDirectories];
}

/**
 * Normalize path to handle platform differences
 */
export function normalizePath(p: string): string {
  return path.normalize(p);
}

/**
 * Expand ~ to user's home directory
 */
export function expandHome(filepath: string): string {
  if (filepath.startsWith('~/') || filepath === '~') {
    return path.join(os.homedir(), filepath.slice(1));
  }
  return filepath;
}

/**
 * Validate that a path is NOT within disallowed directories
 * Returns the validated absolute path if valid, throws error if invalid
 */
export async function validatePath(requestedPath: string): Promise<string> {
  const expandedPath = expandHome(requestedPath);
  const absolute = path.isAbsolute(expandedPath)
    ? path.resolve(expandedPath)
    : path.resolve(process.cwd(), expandedPath);

  const normalizedRequested = normalizePath(absolute);

  // Check if path is inside any disallowed directory
  const isDisallowed = disallowedDirectories.some(dir => normalizedRequested.startsWith(dir));
  if (isDisallowed) {
    throw new Error(`Access denied - path is inside a disallowed directory: ${absolute}`);
  }

  // Handle symlinks by checking their real path
  try {
    const realPath = await fs.realpath(absolute);
    const normalizedReal = normalizePath(realPath);
    const isRealPathDisallowed = disallowedDirectories.some(dir => normalizedReal.startsWith(dir));
    if (isRealPathDisallowed) {
      throw new Error("Access denied - symlink target inside disallowed directories");
    }
    return realPath;
  } catch (error) {
    // For new files that don't exist yet, verify parent directory
    const parentDir = path.dirname(absolute);
    try {
      const realParentPath = await fs.realpath(parentDir);
      const normalizedParent = normalizePath(realParentPath);
      const isParentDisallowed = disallowedDirectories.some(dir => normalizedParent.startsWith(dir));
      if (isParentDisallowed) {
        throw new Error("Access denied - parent directory is inside a disallowed directory");
      }
      return absolute;
    } catch {
      throw new Error(`Parent directory does not exist: ${parentDir}`);
    }
  }
}

/**
 * Validate disallowed directories at startup
 */
export async function validateDirectories(directories: string[]): Promise<void> {
  await Promise.all(directories.map(async (dir) => {
    try {
      const expandedDir = expandHome(dir);
      const stats = await fs.stat(expandedDir);
      if (!stats.isDirectory()) {
        console.error(`Error: ${dir} is not a directory`);
        process.exit(1);
      }
    } catch (error) {
      console.error(`Error accessing directory ${dir}:`, error);
      process.exit(1);
    }
  }));
}
