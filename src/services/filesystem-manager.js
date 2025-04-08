/**
 * Filesystem Manager
 * Handles file system operations for the MCP server
 */

const fs = require('fs-extra');
const path = require('path');
const logger = require('../utils/logger');

class FileSystemManager {
  constructor() {
    this.rootDirectory = process.env.ROOT_DIRECTORY || './data';
    this.ensureRootDirectory();
    logger.info(`Filesystem Manager initialized with root: ${this.rootDirectory}`);
  }

  /**
   * Ensure the root directory exists
   * @private
   */
  ensureRootDirectory() {
    try {
      fs.ensureDirSync(this.rootDirectory);
    } catch (error) {
      logger.error(`Error creating root directory: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get the absolute path for a relative path
   * @param {string} relativePath - The relative path
   * @returns {string} - The absolute path
   * @private
   */
  getAbsolutePath(relativePath) {
    // Prevent path traversal attacks
    const normalizedPath = path.normalize(relativePath).replace(/^\.\.\//, '');
    return path.join(this.rootDirectory, normalizedPath);
  }

  /**
   * Write data to a file
   * @param {string} filePath - The relative file path
   * @param {string|Buffer|object} data - The data to write
   * @param {object} options - Write options
   * @returns {Promise<boolean>} - Success status
   */
  async writeFile(filePath, data, options = {}) {
    try {
      const absolutePath = this.getAbsolutePath(filePath);
      
      // Ensure the directory exists
      await fs.ensureDir(path.dirname(absolutePath));
      
      // Handle objects by converting to JSON
      if (typeof data === 'object' && !(data instanceof Buffer)) {
        data = JSON.stringify(data, null, 2);
      }
      
      await fs.writeFile(absolutePath, data, options);
      logger.debug(`File written: ${filePath}`);
      return true;
    } catch (error) {
      logger.error(`Error writing file ${filePath}: ${error.message}`);
      return false;
    }
  }

  /**
   * Read data from a file
   * @param {string} filePath - The relative file path
   * @param {object} options - Read options
   * @returns {Promise<string|Buffer|null>} - The file data or null on error
   */
  async readFile(filePath, options = {}) {
    try {
      const absolutePath = this.getAbsolutePath(filePath);
      
      if (!(await this.fileExists(filePath))) {
        logger.debug(`File not found: ${filePath}`);
        return null;
      }
      
      const data = await fs.readFile(absolutePath, options);
      logger.debug(`File read: ${filePath}`);
      return data;
    } catch (error) {
      logger.error(`Error reading file ${filePath}: ${error.message}`);
      return null;
    }
  }

  /**
   * Check if a file exists
   * @param {string} filePath - The relative file path
   * @returns {Promise<boolean>} - Whether the file exists
   */
  async fileExists(filePath) {
    try {
      const absolutePath = this.getAbsolutePath(filePath);
      return await fs.pathExists(absolutePath);
    } catch (error) {
      logger.error(`Error checking file existence ${filePath}: ${error.message}`);
      return false;
    }
  }

  /**
   * Delete a file
   * @param {string} filePath - The relative file path
   * @returns {Promise<boolean>} - Success status
   */
  async deleteFile(filePath) {
    try {
      const absolutePath = this.getAbsolutePath(filePath);
      
      if (!(await this.fileExists(filePath))) {
        logger.debug(`File not found for deletion: ${filePath}`);
        return false;
      }
      
      await fs.remove(absolutePath);
      logger.debug(`File deleted: ${filePath}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting file ${filePath}: ${error.message}`);
      return false;
    }
  }

  /**
   * List files in a directory
   * @param {string} directoryPath - The relative directory path
   * @returns {Promise<string[]|null>} - Array of file names or null on error
   */
  async listFiles(directoryPath = '') {
    try {
      const absolutePath = this.getAbsolutePath(directoryPath);
      
      if (!(await fs.pathExists(absolutePath))) {
        logger.debug(`Directory not found: ${directoryPath}`);
        return null;
      }
      
      const items = await fs.readdir(absolutePath);
      
      // Get stats for each item to determine if it's a file or directory
      const itemStats = await Promise.all(
        items.map(async (item) => {
          const itemPath = path.join(absolutePath, item);
          const stats = await fs.stat(itemPath);
          return {
            name: item,
            isDirectory: stats.isDirectory(),
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime
          };
        })
      );
      
      logger.debug(`Listed ${itemStats.length} items in directory: ${directoryPath}`);
      return itemStats;
    } catch (error) {
      logger.error(`Error listing files in ${directoryPath}: ${error.message}`);
      return null;
    }
  }
}

module.exports = { FileSystemManager };
