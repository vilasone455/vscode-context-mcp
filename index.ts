#!/usr/bin/env node

// This is just an entry point that exports the actual server implementation
import {runServer} from './src/index.js';


runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});