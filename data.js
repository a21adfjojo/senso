// data.js
const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "data");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

const dataFiles = {
  nations: path.join(DATA_DIR, "nations.json"),
  armyDeployment: path.join(DATA_DIR, "armyDeployment.json"),
  alliances: path.join(DATA_DIR, "alliances.json"),
  newsLog: path.join(DATA_DIR, "newsLog.json"),
  chatLog: path.join(DATA_DIR, "chatLog.json"),
  userActivity: path.join(DATA_DIR, "userActivity.json"),
};

let gameData = {};

// Initialize default data if files don't exist
const defaultData = {
  nations: [],
  armyDeployment: [],
  alliances: [],
  newsLog: [],
  chatLog: [],
  userActivity: [],
};

function loadData() {
  for (const key in dataFiles) {
    try {
      const data = fs.readFileSync(dataFiles[key], "utf8");
      gameData[key] = JSON.parse(data);
    } catch (error) {
      if (error.code === "ENOENT") {
        // File not found, initialize with default data
        gameData[key] = defaultData[key];
        saveData(key); // Save the default data
      } else {
        console.error(`Error loading ${key}.json:`, error);
        gameData[key] = defaultData[key]; // Fallback to default
      }
    }
  }
  console.log("Game data loaded.");
}

function saveData(key) {
  try {
    fs.writeFileSync(
      dataFiles[key],
      JSON.stringify(gameData[key], null, 2),
      "utf8"
    );
  } catch (error) {
    console.error(`Error saving ${key}.json:`, error);
  }
}

function getAllNations() {
  return gameData.nations;
}

function setAllNations(nations) {
  gameData.nations = nations;
  saveData("nations");
}

function getAllArmyDeployment() {
  return gameData.armyDeployment;
}

function setAllArmyDeployment(armyDeployment) {
  gameData.armyDeployment = armyDeployment;
  saveData("armyDeployment");
}

function getAllAlliances() {
  return gameData.alliances;
}

function setAllAlliances(alliances) {
  gameData.alliances = alliances;
  saveData("alliances");
}

function getAllNewsLog() {
  return gameData.newsLog;
}

function setAllNewsLog(newsLog) {
  gameData.newsLog = newsLog;
  saveData("newsLog");
}

function getAllChatLog() {
  return gameData.chatLog;
}

function setAllChatLog(chatLog) {
  gameData.chatLog = chatLog;
  saveData("chatLog");
}

function getAllUserActivity() {
  return gameData.userActivity;
}

function setAllUserActivity(userActivity) {
  gameData.userActivity = userActivity;
  saveData("userActivity");
}

// Load data initially when the module is required
loadData();

module.exports = {
  loadData,
  getAllNations,
  setAllNations,
  getAllArmyDeployment,
  setAllArmyDeployment,
  getAllAlliances,
  setAllAlliances,
  getAllNewsLog,
  setAllNewsLog,
  getAllChatLog,
  setAllChatLog,
  getAllUserActivity,
  setAllUserActivity,
};
