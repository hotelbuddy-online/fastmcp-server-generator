/**
 * MCP Client Runner
 * Script to run the MCP client
 */

const { MCPClient } = require('./src/client/mcp-client');

// Load environment variables
require('dotenv').config();

async function main() {
  try {
    console.log('Starting MCP Client...');
    
    const client = new MCPClient({
      host: process.env.SERVER_HOST || 'localhost',
      port: process.env.SERVER_PORT || 3000
    });
    
    // Start interactive session
    await client.startInteractiveSession();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Start the client
main();
