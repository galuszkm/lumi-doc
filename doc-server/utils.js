const fs = require('fs-extra');
const path = require('path');
const mime = require('mime-types');
const { SESSIONS_DIR_NAME } = require('./server.config')

function transformResourcePath(filePath) {
  const sessionsIndex = filePath.indexOf(`\\${SESSIONS_DIR_NAME}\\`);
  if (sessionsIndex === -1) {
    console.warn(`Path does not contain \\${SESSIONS_DIR_NAME}\\`)
  }
  const relevantPath = filePath.substring(sessionsIndex);
  const urlFriendlyPath = relevantPath.replace(/\\/g, '/');
  return urlFriendlyPath;
}

async function getNextSessionIndex(SESSIONS_DIR) {
  const files = await fs.readdir(SESSIONS_DIR);
  const indices = files
    .map(file => parseInt(file.split('_')[0], 10))
    .filter(index => !isNaN(index));
  const maxIndex = indices.length ? Math.max(...indices) : 0;
  return maxIndex + 1;
}

// Function to get the size of a directory
async function getDirectorySize (directory) {
  const files = await fs.readdir(directory);
  const sizes = await Promise.all(files.map(async (file) => {
    const filePath = path.join(directory, file);
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) {
      return getDirectorySize(filePath);
    }
    return stat.size;
  }));
  return sizes.reduce((acc, size) => acc + size, 0);
};

// Function to get the list of files in a directory along with their types
async function getDirectoryFiles(directory) {
  const files = await fs.readdir(directory);
  const fileList = await Promise.all(files.filter(i => !i.startsWith('.')).map(async (file) => {
    const filePath = path.join(directory, file);
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) {
      return null; // Skip directories
    }
    const mimeType = mime.lookup(filePath) || 'unknown';
    const type = mimeType.split('/')[0];
    return {
      filename: file,
      type: type === 'application' ? mime.extension(mimeType) : type,
      size: stat.size,
      path: transformResourcePath(filePath),
      docUrl: `/resources/${file}`,
    };
  }));
  return fileList.filter(file => file !== null); // Filter out null values
}

// Function to remove a file from the specified directory
const removeFile = async (directoryPath, filename) => {
  const filePath = path.join(directoryPath, filename);
  try {
    const exists = await fs.pathExists(filePath);
    if (!exists) {
      throw new Error(`File ${filename} does not exist!`);
    }
    await fs.remove(filePath);
  } catch (err) {
    throw new Error(`Error removing file: ${err.message}`);
  }
};

module.exports = { 
  getNextSessionIndex,
  getDirectorySize,
  getDirectoryFiles,
  removeFile
};
