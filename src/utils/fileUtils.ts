import { createTwoFilesPatch } from 'diff';
// import fs from "fs/promises";
// import { z } from "zod";
// import { EditOperation } from '../schemas/schemas.js';

/**
 * Normalize line endings to ensure consistent behavior across platforms
 */
export function normalizeLineEndings(text: string): string {
  return text.replace(/\r\n/g, '\n');
}

/**
 * Create a unified diff between two text contents
 */
export function createUnifiedDiff(originalContent: string, newContent: string, filepath: string = 'file'): string {
  console.log(`Creating diff for ${filepath}`);
  console.log(`Original content length: ${originalContent.length} characters`);
  console.log(`New content length: ${newContent.length} characters`);

  // Ensure consistent line endings for diff
  const normalizedOriginal = normalizeLineEndings(originalContent);
  const normalizedNew = normalizeLineEndings(newContent);
  
  console.log('Line endings normalized');

  const diffResult = createTwoFilesPatch(
    filepath,
    filepath,
    normalizedOriginal,
    normalizedNew,
    'original',
    'modified'
  );

  console.log(`Diff created successfully. Diff length: ${diffResult.length} characters`);
  return diffResult;
}

/**
 * Apply edits to a file and return a diff of changes
 */
// export async function applyFileEdits(
//   filePath: string,
//   edits: z.infer<typeof EditOperation>[],
//   dryRun = false
// ): Promise<string> {
//   // Read file content and normalize line endings
//   const content = normalizeLineEndings(await fs.readFile(filePath, 'utf-8'));

//   // Apply edits sequentially
//   let modifiedContent = content;
//   for (const edit of edits) {
//     const normalizedOld = normalizeLineEndings(edit.oldText);
//     const normalizedNew = normalizeLineEndings(edit.newText);

//     // If exact match exists, use it
//     if (modifiedContent.includes(normalizedOld)) {
//       modifiedContent = modifiedContent.replace(normalizedOld, normalizedNew);
//       continue;
//     }

//     // Otherwise, try line-by-line matching with flexibility for whitespace
//     const oldLines = normalizedOld.split('\n');
//     const contentLines = modifiedContent.split('\n');
//     let matchFound = false;

//     for (let i = 0; i <= contentLines.length - oldLines.length; i++) {
//       const potentialMatch = contentLines.slice(i, i + oldLines.length);

//       // Compare lines with normalized whitespace
//       const isMatch = oldLines.every((oldLine, j) => {
//         const contentLine = potentialMatch[j];
//         return oldLine.trim() === contentLine.trim();
//       });

//       if (isMatch) {
//         // Preserve original indentation of first line
//         const originalIndent = contentLines[i].match(/^\s*/)?.[0] || '';
//         const newLines = normalizedNew.split('\n').map((line, j) => {
//           if (j === 0) return originalIndent + line.trimStart();
//           // For subsequent lines, try to preserve relative indentation
//           const oldIndent = oldLines[j]?.match(/^\s*/)?.[0] || '';
//           const newIndent = line.match(/^\s*/)?.[0] || '';
//           if (oldIndent && newIndent) {
//             const relativeIndent = newIndent.length - oldIndent.length;
//             return originalIndent + ' '.repeat(Math.max(0, relativeIndent)) + line.trimStart();
//           }
//           return line;
//         });

//         contentLines.splice(i, oldLines.length, ...newLines);
//         modifiedContent = contentLines.join('\n');
//         matchFound = true;
//         break;
//       }
//     }

//     if (!matchFound) {
//       throw new Error(`Could not find exact match for edit:\n${edit.oldText}`);
//     }
//   }

//   // Create unified diff
//   const diff = createUnifiedDiff(content, modifiedContent, filePath);

//   // Format diff with appropriate number of backticks
//   let numBackticks = 3;
//   while (diff.includes('`'.repeat(numBackticks))) {
//     numBackticks++;
//   }
//   const formattedDiff = `${'`'.repeat(numBackticks)}diff\n${diff}${'`'.repeat(numBackticks)}\n\n`;

//   if (!dryRun) {
//     await fs.writeFile(filePath, modifiedContent, 'utf-8');
//   }

//   return formattedDiff;
// }

