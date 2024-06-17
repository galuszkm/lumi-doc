const path = require("path");

// Server HOST and PORT
const HOST = process.env.HOST || '0.0.0.0';  // Listen on all interfaces by default
const PORT = process.env.PORT || 3000;

// Set static files path
const STATIC_docView = path.join(__dirname, "..", "doc-view", "dist");
const STATIC_docEditor = path.join(__dirname, "..", "doc-editor-ui", "dist");

// Set sessions path
const SESSIONS_DIR_NAME = "sessions";
const SESSIONS_DIR = path.join(__dirname, SESSIONS_DIR_NAME);

// Session default config
const SESSION_CONFIG = {
  resourceFileSizeLimit: 10 * 1024 * 1024, // 10MB in bytes
  allowUsers: [],
  owner: null,
  createTime: getCurrentFormattedTime(),
  totalSizeLimit: 100 * 1024 * 1024 // 100MB in bytes
};

module.exports = {
  HOST,
  PORT,
  STATIC_docView,
  STATIC_docEditor,
  SESSIONS_DIR_NAME,
  SESSIONS_DIR,
  SESSION_CONFIG,
};

// Get formated current date and time
function getCurrentFormattedTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}