// data.js
const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "data");
const NATIONS_FILE = path.join(DATA_DIR, "nations.json");
const ARMY_DEPLOYMENT_FILE = path.join(DATA_DIR, "armyDeployment.json");
const NEWS_LOG_FILE = path.join(DATA_DIR, "newsLog.json");
const ALLIANCES_FILE = path.join(DATA_DIR, "alliances.json");
const CHAT_LOG_FILE = path.join(DATA_DIR, "chatLog.json");
const USER_ACTIVITY_FILE = path.join(DATA_DIR, "userActivity.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

// Helper to read JSON data
function readJsonFile(filePath, defaultValue) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
  }
  return defaultValue;
}

// Helper to write JSON data
function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
  }
}

// Nations data
function getAllNations() {
  return readJsonFile(NATIONS_FILE, []);
}

function setAllNations(nations) {
  writeJsonFile(NATIONS_FILE, nations);
}

// Army Deployment data
function getAllArmyDeployment() {
  return readJsonFile(ARMY_DEPLOYMENT_FILE, []);
}

function setAllArmyDeployment(armyDeployment) {
  writeJsonFile(ARMY_DEPLOYMENT_FILE, armyDeployment);
}

// News Log data
function getAllNewsLog() {
  return readJsonFile(NEWS_LOG_FILE, []);
}

function setAllNewsLog(newsLog) {
  writeJsonFile(NEWS_LOG_FILE, newsLog);
}

// Alliances data
function getAllAlliances() {
  return readJsonFile(ALLIANCES_FILE, []);
}

function setAllAlliances(alliances) {
  writeJsonFile(ALLIANCES_FILE, alliances);
}

// Chat Log data
function getAllChatLog() {
  return readJsonFile(CHAT_LOG_FILE, []);
}

function setAllChatLog(chatLog) {
  writeJsonFile(CHAT_LOG_FILE, chatLog);
}

// User Activity data
function getAllUserActivity() {
  return readJsonFile(USER_ACTIVITY_FILE, []);
}

function setAllUserActivity(userActivity) {
  writeJsonFile(USER_ACTIVITY_FILE, userActivity);
}

module.exports = {
  getAllNations,
  setAllNations,
  getAllArmyDeployment,
  setAllArmyDeployment,
  getAllNewsLog,
  setAllNewsLog,
  getAllAlliances,
  setAllAlliances,
  getAllChatLog,
  setAllChatLog,
  getAllUserActivity,
  setAllUserActivity,
};
