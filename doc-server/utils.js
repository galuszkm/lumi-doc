const fs = require('fs-extra');
const path = require('path');
const mime = require('mime-types');
const { SESSIONS_DIR_NAME } = require('./server.config');
const archiver = require('archiver');

const transformResourcePath = (filePath) => {
  const sessionsIndex = filePath.indexOf(`\\${SESSIONS_DIR_NAME}\\`);
  if (sessionsIndex === -1) {
    console.warn(`Path does not contain \\${SESSIONS_DIR_NAME}\\`)
  }
  const relevantPath = filePath.substring(sessionsIndex);
  const urlFriendlyPath = relevantPath.replace(/\\/g, '/');
  return urlFriendlyPath;
}

const getNextSessionIndex = async(SESSIONS_DIR) => {
  const files = await fs.readdir(SESSIONS_DIR);
  const indices = files
    .map(file => parseInt(file.split('_')[0], 10))
    .filter(index => !isNaN(index));
  const maxIndex = indices.length ? Math.max(...indices) : 0;
  return maxIndex + 1;
}

// Get the size of a directory
const getDirectorySize = async (directory) => {
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

// Get the list of files in a directory along with their types
const getDirectoryFiles = async (directory) => {
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

// Get all sessions in dir and their session.config content
const getFoldersWithSessionConfig = (directoryPath) => {
  const foldersWithConfig = [];

  function traverseDirectory(currentPath) {
    const items = fs.readdirSync(currentPath);

    items.forEach((item) => {
      const itemPath = path.join(currentPath, item);
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        const configPath = path.join(itemPath, "session.config");
        if (fs.existsSync(configPath)) {
          const configContent = JSON.parse(
            fs.readFileSync(configPath, "utf-8")
          );
          foldersWithConfig.push({
            id: item,
            ...configContent,
          });
        }
        // Recursive call to traverse subdirectories
        traverseDirectory(itemPath);
      }
    });
  }
  traverseDirectory(directoryPath);
  return foldersWithConfig;
}

// Function to zip a folder excluding specified files or folders
const zipFolder = ({ folderPath, except }) => {
  const archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level
  });

  fs.readdirSync(folderPath).forEach(file => {
    const fullPath = path.join(folderPath, file);
    const isExcluded = except.some(exclusion => fullPath.includes(exclusion));
    
    if (!isExcluded) {
      if (fs.lstatSync(fullPath).isDirectory()) {
        archive.directory(fullPath, file);
      } else {
        archive.file(fullPath, { name: file });
      }
    }
  });

  archive.finalize();
  return archive;
};

module.exports = { 
  getNextSessionIndex,
  getDirectorySize,
  getDirectoryFiles,
  removeFile,
  getFoldersWithSessionConfig,
  zipFolder,
};
