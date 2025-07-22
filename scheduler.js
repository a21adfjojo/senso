// scheduler.js
const gameLogic = require("./gameLogic");

// Interval times in milliseconds
// 1ターンを5分 (5 * 60 * 1000 ミリ秒) に変更
const INCOME_INTERVAL = 5 * 60 * 1000; // 5 minutes
const RESOURCE_INTERVAL = 5 * 60 * 1000; // 5 minutes
const FOCUS_PROGRESS_INTERVAL = 5 * 60 * 1000; // 5 minutes
const NATION_CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes (これは以前から5分なので変更なし)

function startSchedulers() {
  console.log("Starting game schedulers...");

  // Add income and population growth
  setInterval(() => {
    gameLogic.addIncomePerMinute();
    console.log("Processed income and population growth.");
  }, INCOME_INTERVAL);

  // Add resources
  setInterval(() => {
    gameLogic.addResourcesPerMinute();
    console.log("Processed resource production.");
  }, RESOURCE_INTERVAL);

  // Process national focus progress
  setInterval(() => {
    gameLogic.processNationalFocusProgress();
    console.log("Processed national focus progress.");
  }, FOCUS_PROGRESS_INTERVAL);

  // Remove nations without territories
  setInterval(() => {
    gameLogic.removeNationsWithoutTerritories();
    console.log("Checked for eliminated nations.");
  }, NATION_CLEANUP_INTERVAL);

  // Initial run for all
  gameLogic.addIncomePerMinute();
  gameLogic.addResourcesPerMinute();
  gameLogic.processNationalFocusProgress();
  gameLogic.removeNationsWithoutTerritories();

  // Example news message (optional, from original GAS)
  // gameLogic.addNews("現在の緊張度:241 / 300 理由:核保有国が複数あり不確実性が高い 交渉やスパイ活動が活発で心理戦が続いている インド帝国の圧倒的な軍事・経済力が周囲を警戒させている");
}

module.exports = {
  startSchedulers,
};
