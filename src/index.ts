#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { 
  expandHome,
  initializeDisallowedDirectories
} from "./security/pathValidation.js";
import { getToolsList, handleToolCall } from "./tools/index.js";

// Command line argument parsing
const args = process.argv.slice(2);
// if (args.length === 0) {
//   console.error("Usage: mcp-server-filesystem <allowed-directory> [additional-directories...]");
// }

// Store expanded directories
const expandedDirectories = args.map(dir => expandHome(dir));

// Initialize server
async function initializeServer() {
  try {
    // Validate that all directories exist and are accessible
    // await validateDirectories(expandedDirectories);
    
    // Initialize allowed directories after validation
    initializeDisallowedDirectories(expandedDirectories);
    
    // Create server instance
    const server = new Server(
      {
        name: "vscode-context-mcp",
        version: "0.2.0",
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );
    
    // Set up tool handlers
    server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: getToolsList(),
      };
    });
    
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      return await handleToolCall(name, args);
    });
    
    return server;
  } catch (error) {
    console.error("Error initializing server:", error);
    process.exit(1);
  }
}

// Start server
export async function runServer() {
  const server = await initializeServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Secure MCP Filesystem Server running on stdio");
  // console.error("Allowed directories:", expandedDirectories);
}

// runServer().catch((error) => {
//   console.error("Fatal error running server:", error);
//   process.exit(1);
// });