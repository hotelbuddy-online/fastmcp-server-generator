/**
 * Create MCP Server
 * Script to create a new MCP server with predefined configuration
 */

const { MCPClient } = require('./src/client/mcp-client');
const inquirer = require('inquirer');
const chalk = require('chalk');

// Load environment variables
require('dotenv').config();

/**
 * Gather server requirements through interactive prompts
 */
async function gatherRequirements() {
  console.log(chalk.blue('Please provide information about your MCP server:'));
  
  const questions = [
    {
      type: 'input',
      name: 'serverName',
      message: 'What is the name of your MCP server?',
      default: 'MyMCPServer'
    },
    {
      type: 'input',
      name: 'port',
      message: 'Which port should your server run on?',
      default: '3000',
      validate: (value) => !isNaN(parseInt(value)) ? true : 'Please enter a valid port number'
    },
    {
      type: 'confirm',
      name: 'useAuthentication',
      message: 'Do you want to enable authentication for your server?',
      default: true
    },
    {
      type: 'checkbox',
      name: 'selectedFeatures',
      message: 'Select the features you want to include:',
      choices: [
        { name: 'Memory Management', value: 'memory', checked: true },
        { name: 'File System Operations', value: 'filesystem', checked: true },
        { name: 'Task Scheduling', value: 'taskScheduler' },
        { name: 'Data Persistence', value: 'dataPersistence' },
        { name: 'WebSocket Support', value: 'websocket' },
        { name: 'RESTful API', value: 'restApi' },
        { name: 'User Management', value: 'userManagement' }
      ]
    },
    {
      type: 'input',
      name: 'memoryLimit',
      message: 'What is the memory limit for your server (in MB)?',
      default: '1024',
      when: (answers) => answers.selectedFeatures.includes('memory'),
      validate: (value) => !isNaN(parseInt(value)) ? true : 'Please enter a valid number'
    },
    {
      type: 'confirm',
      name: 'useSharedMemory',
      message: 'Do you want to enable shared memory between clients?',
      default: false,
      when: (answers) => answers.selectedFeatures.includes('memory')
    },
    {
      type: 'input',
      name: 'rootDirectory',
      message: 'What is the root directory for file operations?',
      default: './data',
      when: (answers) => answers.selectedFeatures.includes('filesystem')
    },
    {
      type: 'confirm',
      name: 'allowRemoteAccess',
      message: 'Do you want to allow remote file access?',
      default: false,
      when: (answers) => answers.selectedFeatures.includes('filesystem')
    },
    {
      type: 'confirm',
      name: 'useDocker',
      message: 'Do you want to containerize your MCP server with Docker?',
      default: false
    },
    {
      type: 'confirm',
      name: 'generateTests',
      message: 'Do you want to generate test files for your server?',
      default: true
    },
    {
      type: 'list',
      name: 'loggingLevel',
      message: 'Select the logging level:',
      choices: ['error', 'warn', 'info', 'debug'],
      default: 'info'
    }
  ];
  
  return inquirer.prompt(questions);
}

async function main() {
  try {
    console.log(chalk.green('MCP Server Creator'));
    
    // Gather requirements
    const requirements = await gatherRequirements();
    
    console.log('\n' + chalk.blue('Connecting to MCP server generator...'));
    
    // Connect to the server generator
    const client = new MCPClient({
      host: process.env.SERVER_HOST || 'localhost',
      port: process.env.SERVER_PORT || 3000
    });
    
    const connected = await client.connect();
    if (!connected) {
      console.error(chalk.red('Failed to connect to the MCP server generator.'));
      return;
    }
    
    // Send the create-server command with requirements
    console.log(chalk.blue('Generating MCP server...'));
    const result = await client.executeCommand('create-server', { requirements });
    
    if (result.success) {
      console.log(chalk.green('\nServer generated successfully!'));
      console.log(chalk.cyan('Files generated:'));
      result.data.files.forEach(file => {
        console.log(`- ${file}`);
      });
      
      console.log('\n' + chalk.yellow(`Your server has been created in the ${result.data.outputDirectory} directory.`));
      console.log(chalk.yellow('To start your server:'));
      console.log(`  cd ${result.data.outputDirectory}`);
      console.log('  npm install');
      console.log('  npm start');
    } else {
      console.error(chalk.red('\nFailed to generate server:'));
      console.error(chalk.red(result.message || 'Unknown error'));
    }
    
    // Disconnect
    await client.disconnect();
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
  }
}

// Start the script
main();
