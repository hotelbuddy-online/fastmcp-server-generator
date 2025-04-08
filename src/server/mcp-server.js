/**
 * MCP Server implementation
 * Core server functionality using FastMCP
 */

const fastmcp = require('fastmcp');
const chalk = require('chalk');
const logger = require('../utils/logger');
const { MemoryManager } = require('../services/memory-manager');
const { FileSystemManager } = require('../services/filesystem-manager');
const { ServerGenerator } = require('../generators/server-generator');
const { questionManager } = require('./question-manager');

class MCPServer {
  constructor() {
    this.server = null;
    this.memoryManager = new MemoryManager();
    this.filesystemManager = new FileSystemManager();
    this.serverGenerator = new ServerGenerator(this.memoryManager, this.filesystemManager);
  }

  async initialize() {
    logger.info('Initializing MCP Server...');
    
    // Create the FastMCP server instance
    this.server = new fastmcp.Server({
      name: 'FastMCP Server Generator',
      version: '1.0.0',
      port: process.env.PORT || 3000
    });

    // Register services
    this.registerServices();
    
    // Register command handlers
    this.registerCommands();
    
    logger.info('MCP Server initialized');
  }

  registerServices() {
    // Register memory manager
    this.server.registerService('memory', this.memoryManager);
    
    // Register filesystem manager
    this.server.registerService('filesystem', this.filesystemManager);
    
    // Register server generator
    this.server.registerService('generator', this.serverGenerator);
  }

  registerCommands() {
    // Register the create-server command
    this.server.registerCommand('create-server', async (params, connection) => {
      logger.info('Received create-server command');
      
      try {
        // Start the interactive questioning process
        const requirements = await questionManager.gatherRequirements(connection);
        
        // Store the requirements in memory
        this.memoryManager.storeData('serverRequirements', requirements);
        
        // Generate the server based on the requirements
        const result = await this.serverGenerator.generateServer(requirements);
        
        return {
          success: true,
          message: 'Server generated successfully',
          data: result
        };
      } catch (error) {
        logger.error(`Error creating server: ${error.message}`);
        return {
          success: false,
          message: `Failed to create server: ${error.message}`
        };
      }
    });

    // Register the get-template command
    this.server.registerCommand('get-template', async (params, connection) => {
      const { templateName } = params;
      
      try {
        const template = await this.serverGenerator.getTemplate(templateName);
        return {
          success: true,
          data: template
        };
      } catch (error) {
        return {
          success: false,
          message: `Template not found: ${error.message}`
        };
      }
    });
  }

  async start() {
    logger.info('Starting MCP Server...');
    
    await this.server.start();
    
    const address = this.server.getAddress();
    logger.info(chalk.green(`MCP Server listening on ${address.address}:${address.port}`));
  }

  async stop() {
    if (this.server) {
      logger.info('Stopping MCP Server...');
      await this.server.stop();
      logger.info('MCP Server stopped');
    }
  }
}

module.exports = { MCPServer };
