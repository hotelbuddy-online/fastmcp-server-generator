/**
 * Memory Manager
 * Handles in-memory storage and retrieval for the MCP server
 */

const logger = require('../utils/logger');

class MemoryManager {
  constructor() {
    this.memoryStore = new Map();
    logger.info('Memory Manager initialized');
  }

  /**
   * Store data in memory
   * @param {string} key - The key to store the data under
   * @param {any} data - The data to store
   * @returns {boolean} - Success status
   */
  storeData(key, data) {
    try {
      this.memoryStore.set(key, data);
      logger.debug(`Stored data with key: ${key}`);
      return true;
    } catch (error) {
      logger.error(`Error storing data: ${error.message}`);
      return false;
    }
  }

  /**
   * Retrieve data from memory
   * @param {string} key - The key to retrieve data for
   * @returns {any} - The stored data or null if not found
   */
  retrieveData(key) {
    try {
      if (!this.memoryStore.has(key)) {
        logger.debug(`Data not found for key: ${key}`);
        return null;
      }
      
      logger.debug(`Retrieved data for key: ${key}`);
      return this.memoryStore.get(key);
    } catch (error) {
      logger.error(`Error retrieving data: ${error.message}`);
      return null;
    }
  }

  /**
   * Delete data from memory
   * @param {string} key - The key to delete
   * @returns {boolean} - Success status
   */
  deleteData(key) {
    try {
      if (!this.memoryStore.has(key)) {
        logger.debug(`Data not found for key: ${key}`);
        return false;
      }
      
      this.memoryStore.delete(key);
      logger.debug(`Deleted data for key: ${key}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting data: ${error.message}`);
      return false;
    }
  }

  /**
   * Clear all data from memory
   * @returns {boolean} - Success status
   */
  clearAllData() {
    try {
      this.memoryStore.clear();
      logger.debug('Cleared all memory data');
      return true;
    } catch (error) {
      logger.error(`Error clearing data: ${error.message}`);
      return false;
    }
  }

  /**
   * Get memory usage statistics
   * @returns {object} - Memory usage stats
   */
  getMemoryStats() {
    return {
      itemCount: this.memoryStore.size,
      keys: Array.from(this.memoryStore.keys()),
      processMemoryUsage: process.memoryUsage()
    };
  }
}

module.exports = { MemoryManager };
