/**
 * MCP Client
 * A simple client for testing the MCP server
 */

const fastmcp = require('fastmcp');
const inquirer = require('inquirer');
const chalk = require('chalk');

class MCPClient {
  constructor(options = {}) {
    this.options = {
      host: 'localhost',
      port: process.env.PORT || 3000,
      ...options
    };
    
    this.client = new fastmcp.Client(this.options);
    this.connected = false;
  }
  
  /**
   * Connect to the MCP server
   */
  async connect() {
    try {
      console.log(chalk.blue(`Connecting to MCP server at ${this.options.host}:${this.options.port}...`));
      
      await this.client.connect();
      this.connected = true;
      
      console.log(chalk.green('Connected to MCP server'));
      
      // Set up connection event handlers
      this.client.on('disconnect', () => {
        console.log(chalk.yellow('Disconnected from MCP server'));
        this.connected = false;
      });
      
      this.client.on('error', (error) => {
        console.error(chalk.red(`Connection error: ${error.message}`));
      });
      
      return true;
    } catch (error) {
      console.error(chalk.red(`Failed to connect: ${error.message}`));
      return false;
    }
  }
  
  /**
   * Disconnect from the MCP server
   */
  async disconnect() {
    if (this.connected) {
      await this.client.disconnect();
      this.connected = false;
      console.log(chalk.yellow('Disconnected from MCP server'));
    }
  }
  
  /**
   * Execute a command on the MCP server
   * @param {string} command - The command to execute
   * @param {object} params - Command parameters
   * @returns {Promise<object>} - Command result
   */
  async executeCommand(command, params = {}) {
    if (!this.connected) {
      console.error(chalk.red('Not connected to MCP server'));
      return { success: false, error: 'Not connected' };
    }
    
    try {
      console.log(chalk.blue(`Executing command: ${command}`));
      const result = await this.client.execute(command, params);
      return result;
    } catch (error) {
      console.error(chalk.red(`Command error: ${error.message}`));
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Start an interactive session
   */
  async startInteractiveSession() {
    if (!this.connected) {
      const connected = await this.connect();
      if (!connected) {
        return;
      }
    }
    
    console.log(chalk.green('Starting interactive session. Type "exit" to quit.'));
    
    let running = true;
    
    while (running) {
      const { command } = await inquirer.prompt([
        {
          type: 'input',
          name: 'command',
          message: 'Enter command:',
          validate: (input) => input.trim().length > 0 || 'Command cannot be empty'
        }
      ]);
      
      if (command.toLowerCase() === 'exit') {
        running = false;
        continue;
      }
      
      // Parse command and parameters
      const [cmd, ...paramParts] = command.split(' ');
      let params = {};
      
      if (paramParts.length > 0) {
        try {
          // Try to parse parameters as JSON
          params = JSON.parse(paramParts.join(' '));
        } catch (error) {
          console.log(chalk.yellow('Could not parse parameters as JSON, treating as string'));
          params = { value: paramParts.join(' ') };
        }
      }
      
      // Execute the command
      const result = await this.executeCommand(cmd, params);
      
      // Display result
      console.log(chalk.cyan('Result:'));
      console.log(JSON.stringify(result, null, 2));
      console.log();
    }
    
    await this.disconnect();
  }
  
  /**
   * Create a server using the generator
   * @returns {Promise<object>} - Result of server creation
   */
  async createServer() {
    if (!this.connected) {
      const connected = await this.connect();
      if (!connected) {
        return { success: false, error: 'Failed to connect' };
      }
    }
    
    console.log(chalk.green('Starting server creation process...'));
    
    // Execute the create-server command
    const result = await this.executeCommand('create-server');
    
    return result;
  }
}

// Create and start client if run directly
if (require.main === module) {
  const client = new MCPClient();
  
  // Start interactive session
  client.startInteractiveSession().catch(error => {
    console.error(chalk.red(`Client error: ${error.message}`));
    process.exit(1);
  });
}

module.exports = { MCPClient };
