import fs from "fs/promises";
import path from "path";
import { validatePath } from "../../security/pathValidation.js";
import { TreeEntry } from "../../schemas/schemas.js";
import { minimatch } from 'minimatch';
// Not importing readFile since we need to validate paths ourselves

/**
 * Parse a .gitignore file and return patterns
 */
async function parseGitignore(gitignorePath: string): Promise<string[]> {
  try {
    const validPath = await validatePath(gitignorePath);
    const content = await fs.readFile(validPath, 'utf-8');
    
    return content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))
      .map(pattern => {
        // Convert .gitignore patterns to minimatch patterns
        if (pattern.startsWith('!')) {
          // Negated patterns not supported in this simple implementation
          return '';
        }
        // Handle directory-specific patterns (ending with /)
        if (pattern.endsWith('/')) {
          return `**/${pattern}**`;
        }
        return `**/${pattern}`;
      })
      .filter(Boolean);
  } catch (error) {
    // If .gitignore doesn't exist or can't be read, return empty array
    return [];
  }
}

/**
 * Create a directory
 */
export async function createDirectory(dirPath: string): Promise<string> {
  const validPath = await validatePath(dirPath);
  await fs.mkdir(validPath, { recursive: true });
  return `Successfully created directory ${dirPath}`;
}

/**
 * List contents of a directory
 */
export async function listDirectory(dirPath: string): Promise<string> {
  const validPath = await validatePath(dirPath);
  const entries = await fs.readdir(validPath, { withFileTypes: true });
  return entries
    .map((entry) => `${entry.isDirectory() ? "[DIR]" : "[FILE]"} ${entry.name}`)
    .join("\n");
}

/**
 * Get recursive directory tree, respecting .gitignore
 */
export async function directoryTree(dirPath: string): Promise<string> {
  // Parse initial .gitignore file at the root
  const gitignorePath = path.join(dirPath, '.gitignore');
  const rootGitignorePatterns = await parseGitignore(gitignorePath);
  
  // Cache for .gitignore patterns found in subdirectories
  const gitignoreCache = new Map<string, string[]>();
  gitignoreCache.set(dirPath, rootGitignorePatterns);
  
  async function buildTree(currentPath: string, parentGitignorePatterns: string[] = []): Promise<TreeEntry[]> {
    const validPath = await validatePath(currentPath);
    const entries = await fs.readdir(validPath, { withFileTypes: true });
    const result: TreeEntry[] = [];
    
    // Get patterns from parent directories plus any in this directory
    let currentGitignorePatterns = [...parentGitignorePatterns];
    
    // Check for .gitignore in this directory if not already cached
    if (!gitignoreCache.has(currentPath)) {
      const localGitignorePath = path.join(currentPath, '.gitignore');
      const localPatterns = await parseGitignore(localGitignorePath);
      gitignoreCache.set(currentPath, localPatterns);
      
      // Add new patterns to current list
      currentGitignorePatterns = [...currentGitignorePatterns, ...localPatterns];
    } else {
      // Use cached patterns
      const cachedPatterns = gitignoreCache.get(currentPath) || [];
      currentGitignorePatterns = [...currentGitignorePatterns, ...cachedPatterns];
    }

    for (const entry of entries) {
      const entryPath = path.join(currentPath, entry.name);
      const relativePath = path.relative(dirPath, entryPath);
      
      // Check if this entry should be excluded by .gitignore patterns
      const shouldExclude = currentGitignorePatterns.some(pattern => {
        return minimatch(relativePath, pattern, { dot: true, matchBase: true });
      });
      
      if (shouldExclude) {
        continue;
      }
      
      const entryData: TreeEntry = {
        name: entry.name,
        type: entry.isDirectory() ? 'directory' : 'file'
      };

      if (entry.isDirectory()) {
        entryData.children = await buildTree(entryPath, currentGitignorePatterns);
      }

      result.push(entryData);
    }

    return result;
  }

  const treeData = await buildTree(dirPath, rootGitignorePatterns);
  return JSON.stringify(treeData, null, 2);
}

/**
 * Search for files matching a pattern, respecting .gitignore
 */
export async function searchFiles(
  rootPath: string,
  pattern: string,
  excludePatterns: string[] = []
): Promise<string> {
  const results: string[] = [];
  
  // Check for .gitignore in the root path
  const gitignorePath = path.join(rootPath, '.gitignore');
  const gitignorePatterns = await parseGitignore(gitignorePath);
  
  // Combine user-provided exclude patterns with .gitignore patterns
  const allExcludePatterns = [...excludePatterns, ...gitignorePatterns];

  // Cache for .gitignore patterns found in subdirectories
  const gitignoreCache = new Map<string, string[]>();
  gitignoreCache.set(rootPath, gitignorePatterns);

  async function search(currentPath: string, parentGitignorePatterns: string[] = []) {
    // Get patterns from parent directories plus any in this directory
    let currentGitignorePatterns = [...parentGitignorePatterns];
    
    // Check for .gitignore in this directory if not already cached
    if (!gitignoreCache.has(currentPath)) {
      const localGitignorePath = path.join(currentPath, '.gitignore');
      const localPatterns = await parseGitignore(localGitignorePath);
      gitignoreCache.set(currentPath, localPatterns);
      
      // Add new patterns to current list
      currentGitignorePatterns = [...currentGitignorePatterns, ...localPatterns];
    } else {
      // Use cached patterns
      const cachedPatterns = gitignoreCache.get(currentPath) || [];
      currentGitignorePatterns = [...currentGitignorePatterns, ...cachedPatterns];
    }
    
    const entries = await fs.readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      try {
        // Validate each path before processing
        await validatePath(fullPath);

        // Check if path matches any exclude pattern
        const relativePath = path.relative(rootPath, fullPath);
        
        // Convert user patterns to the right format
        const formattedUserPatterns = excludePatterns.map(pattern => 
          pattern.includes('*') ? pattern : `**/${pattern}/**`
        );

        // Check against all exclude patterns (user-provided + all .gitignore files)
        const shouldExclude = [...formattedUserPatterns, ...currentGitignorePatterns].some(pattern => {
          return minimatch(relativePath, pattern, { dot: true, matchBase: true });
        });

        if (shouldExclude) {
          continue;
        }

        if (entry.name.toLowerCase().includes(pattern.toLowerCase())) {
          results.push(fullPath);
        }

        if (entry.isDirectory()) {
          await search(fullPath, currentGitignorePatterns);
        }
      } catch (error) {
        // Skip invalid paths during search
        continue;
      }
    }
  }

  await search(rootPath);
  return results.length > 0 ? results.join("\n") : "No matches found";
}