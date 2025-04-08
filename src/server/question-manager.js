/**
 * Question Manager
 * Handles the interactive questioning process for gathering server requirements
 */

const inquirer = require('inquirer');
const logger = require('../utils/logger');

class QuestionManager {
  constructor() {
    this.questions = this.buildQuestions();
  }

  buildQuestions() {
    return {
      // Basic server configuration questions
      serverBasics: [
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
        }
      ],
      
      // Feature selection questions
      features: [
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
        }
      ],
      
      // Memory management questions (conditionally shown)
      memoryManagement: [
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
        }
      ],
      
      // Filesystem questions (conditionally shown)
      filesystem: [
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
        }
      ],
      
      // Advanced configuration
      advanced: [
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
      ]
    };
  }

  async gatherRequirements(connection) {
    logger.info('Starting requirements gathering process');
    
    // In a real MCP server, we would use the connection to send questions to the client
    // and receive responses. For this example, we'll simulate it with direct inquirer usage.
    
    // Combine all question groups
    const allQuestions = [
      ...this.questions.serverBasics,
      ...this.questions.features,
      ...this.questions.memoryManagement,
      ...this.questions.filesystem,
      ...this.questions.advanced
    ];
    
    // For demonstration, return a simulated set of answers
    // In a real implementation, we would use:
    // const answers = await inquirer.prompt(allQuestions);
    
    const simulatedAnswers = {
      serverName: 'ExampleMCPServer',
      port: '3000',
      useAuthentication: true,
      selectedFeatures: ['memory', 'filesystem', 'taskScheduler'],
      memoryLimit: '2048',
      useSharedMemory: true,
      rootDirectory: './data',
      allowRemoteAccess: false,
      useDocker: true,
      generateTests: true,
      loggingLevel: 'info'
    };
    
    logger.info('Requirements gathering completed');
    return simulatedAnswers;
  }

  // In a real implementation, we would add methods to send questions to the client
  // and process responses asynchronously through the connection
}

module.exports = { questionManager: new QuestionManager() };
