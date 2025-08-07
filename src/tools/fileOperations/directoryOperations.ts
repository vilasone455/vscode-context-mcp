import fs from "fs/promises";
import path from "path";
import { validatePath } from "../../security/pathValidation.js";
import { FlatTreeData } from "../../schemas/schemas.js";
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
 * Get flattened directory tree, respecting .gitignore and ignoreFolders
 */
export async function directoryTree(dirPath: string, ignoreFolders: string[] = []): Promise<string> {
  // Parse initial .gitignore file at the root
  const gitignorePath = path.join(dirPath, '.gitignore');
  const rootGitignorePatterns = await parseGitignore(gitignorePath);
  
  // Cache for .gitignore patterns found in subdirectories
  const gitignoreCache = new Map<string, string[]>();
  gitignoreCache.set(dirPath, rootGitignorePatterns);
  
  // Smart filtering: ignore verbose hidden directories but keep useful ones
  const ignoredHiddenDirs = ['.git', '.DS_Store', '.idea'];
  
  // Convert ignoreFolders to patterns for matching
  const ignoreFolderPatterns = ignoreFolders.map(folder => {
    // Normalize path separators
    const normalizedFolder = folder.replace(/\\/g, '/');
    
    // If it starts with ./ remove it
    const cleanFolder = normalizedFolder.startsWith('./') ? normalizedFolder.slice(2) : normalizedFolder;
    
    // If it doesn't contain wildcards, create patterns to match both the directory and its contents
    if (!cleanFolder.includes('*') && !cleanFolder.includes('?')) {
      const baseName = cleanFolder.endsWith('/') ? cleanFolder.slice(0, -1) : cleanFolder;
      // Return the base pattern that will match the directory itself
      return baseName;
    }
    
    // If it already has wildcards, use as-is
    return cleanFolder;
  });
  
  const directories: string[] = [];
  const files: string[] = [];
  
  async function traverse(currentPath: string, parentGitignorePatterns: string[] = []) {
    const validPath = await validatePath(currentPath);
    const entries = await fs.readdir(validPath, { withFileTypes: true });
    
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
      const shouldExcludeByGitignore = currentGitignorePatterns.some(pattern => {
        return minimatch(relativePath, pattern, { dot: true, matchBase: true });
      });
      
      // Check if this entry should be excluded by ignoreFolders patterns
      const shouldExcludeByIgnoreFolders = ignoreFolderPatterns.some(pattern => {
        // Check both the relative path and just the entry name
        return minimatch(relativePath, pattern, { dot: true, matchBase: true }) ||
               minimatch(entry.name, pattern, { dot: true, matchBase: true });
      });
      
      if (shouldExcludeByGitignore || shouldExcludeByIgnoreFolders) {
        continue;
      }
      
      // Smart filtering: completely skip verbose hidden directories
      if (entry.isDirectory() && ignoredHiddenDirs.includes(entry.name)) {
        continue; // Skip both adding to list and traversing
      }
      
      if (entry.isDirectory()) {
        // Add directory with trailing slash
        directories.push(relativePath + '/');
        // Recursively traverse subdirectories  
        await traverse(entryPath, currentGitignorePatterns);
      } else {
        // Add file with its relative path
        files.push(relativePath);
      }
    }
  }

  await traverse(dirPath, rootGitignorePatterns);
  
  const result: FlatTreeData = {
    d: directories.sort(),
    f: files.sort()
  };
  
  return JSON.stringify(result, null, 2);
}

/**
 * Search for files matching a pattern, respecting .gitignore
 */
export async function searchFiles(
  rootPath: string,
  pattern: string,
  excludePatterns: string[] = [],
  ignoreFolders: string[] = []
): Promise<string> {
  const results: string[] = [];
  
  // Check for .gitignore in the root path
  const gitignorePath = path.join(rootPath, '.gitignore');
  const gitignorePatterns = await parseGitignore(gitignorePath);
  
  // Convert ignoreFolders to patterns for matching
  const ignoreFolderPatterns = ignoreFolders.map(folder => {
    // Normalize path separators
    const normalizedFolder = folder.replace(/\\/g, '/');
    
    // If it starts with ./ remove it
    const cleanFolder = normalizedFolder.startsWith('./') ? normalizedFolder.slice(2) : normalizedFolder;
    
    // If it doesn't contain wildcards, create patterns to match both the directory and its contents
    if (!cleanFolder.includes('*') && !cleanFolder.includes('?')) {
      const baseName = cleanFolder.endsWith('/') ? cleanFolder.slice(0, -1) : cleanFolder;
      // Return the base pattern that will match the directory itself
      return baseName;
    }
    
    // If it already has wildcards, use as-is
    return cleanFolder;
  });
  
  // Combine user-provided exclude patterns with .gitignore patterns and ignoreFolders
  const allExcludePatterns = [...excludePatterns, ...gitignorePatterns, ...ignoreFolderPatterns];

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
        
        // Check if this entry should be excluded by ignoreFolders patterns
        const shouldExcludeByIgnoreFolders = ignoreFolderPatterns.some(pattern => {
          // Check both the relative path and just the entry name
          return minimatch(relativePath, pattern, { dot: true, matchBase: true }) ||
                 minimatch(entry.name, pattern, { dot: true, matchBase: true });
        });
        
        if (shouldExcludeByIgnoreFolders) {
          continue;
        }
        
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