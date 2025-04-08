/**
 * FastMCP Server Generator
 * Entry point for the MCP server specialized in creating MCP servers
 */

const { MCPServer } = require('./server/mcp-server');
const logger = require('./utils/logger');

// Load environment variables
require('dotenv').config();

async function main() {
  try {
    logger.info('Starting FastMCP Server Generator...');
    
    const server = new MCPServer();
    await server.initialize();
    await server.start();
    
    logger.info('Server started successfully');
  } catch (error) {
    logger.error(`Error starting server: ${error.message}`);
    process.exit(1);
  }
}

// Start the server
main();
