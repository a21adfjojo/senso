// server.js
const express = require("express");
const path = require("path");
const cors = require("cors"); // For development, allows cross-origin requests
const gameLogic = require("./gameLogic");
const scheduler = require("./scheduler");
const data = require("./data"); // To ensure data is loaded at startup

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for correct IP address retrieval (e.g., when deployed on Render)
app.set("trust proxy", 1);

// Middleware
app.use(cors()); // Enable CORS for all routes (important for frontend development)
app.use(express.json()); // Parse JSON request bodies
app.use(express.static(path.join(__dirname, "public"))); // Serve static files from 'public' directory

// --- API Endpoints ---

// Data retrieval
app.get("/api/nations", (req, res) => {
  res.json({ success: true, nations: gameLogic.getNations() });
});

app.get("/api/army-deployment", (req, res) => {
  res.json({ success: true, armyDeployment: gameLogic.getArmyDeployment() });
});

app.get("/api/news", (req, res) => {
  res.json({ success: true, news: gameLogic.getLatestNews() });
});

app.get("/api/chat-messages", (req, res) => {
  res.json({ success: true, messages: gameLogic.getChatMessages() });
});

app.get("/api/alliances", (req, res) => {
  const userIp = req.ip; // Get userIp from request
  res.json(gameLogic.getAlliances(userIp));
});

app.get("/api/online-users", (req, res) => {
  res.json({ success: true, onlineUsers: gameLogic.getOnlineUserNames() });
});

app.get("/api/available-focuses", (req, res) => {
  const userIp = req.ip; // Get userIp from request
  res.json(gameLogic.getAvailableNationalFocuses(userIp));
});

// Game actions (POST requests)
app.post("/api/register-nation", (req, res) => {
  const userIp = req.ip; // Get userIp from request
  const { nationName, countryName } = req.body;
  res.json(gameLogic.registerNation(userIp, nationName, countryName));
});

app.post("/api/buy-territory", (req, res) => {
  const userIp = req.ip; // Get userIp from request
  const { countryName } = req.body;
  res.json(gameLogic.buyTerritory(userIp, countryName));
});

app.post("/api/reinforce-army", (req, res) => {
  const userIp = req.ip; // Get userIp from request
  const { type, amount } = req.body;
  res.json(gameLogic.reinforceArmy(userIp, type, amount));
});

app.post("/api/deploy-army", (req, res) => {
  const userIp = req.ip; // Get userIp from request
  const { countryName, infantry, tank, mechanizedInfantry } = req.body;
  res.json(
    gameLogic.deployArmy(
      userIp,
      countryName,
      infantry,
      tank,
      mechanizedInfantry
    )
  );
});

app.post("/api/auto-deploy-army", (req, res) => {
  const userIp = req.ip; // Get userIp from request
  res.json(gameLogic.autoDeployArmy(userIp));
});

app.post("/api/request-alliance", (req, res) => {
  const userIp = req.ip; // Get userIp from request
  const { targetNationName } = req.body;
  res.json(gameLogic.requestAlliance(userIp, targetNationName));
});

app.post("/api/respond-to-alliance", (req, res) => {
  const userIp = req.ip; // Get userIp from request
  const { requesterIp, response } = req.body; // Expect requesterIp in body
  res.json(gameLogic.respondToAllianceRequest(userIp, requesterIp, response));
});

app.post("/api/dissolve-alliance", (req, res) => {
  const userIp = req.ip; // Get userIp from request
  const { alliedNationIp } = req.body; // Expect alliedNationIp in body
  res.json(gameLogic.dissolveAlliance(userIp, alliedNationIp));
});

app.post("/api/attack-territory", (req, res) => {
  const userIp = req.ip; // Get userIp from request
  const {
    targetCountryName,
    attackInfantry,
    attackTank,
    attackMechanizedInfantry,
  } = req.body;
  res.json(
    gameLogic.attackTerritory(
      userIp,
      targetCountryName,
      attackInfantry,
      attackTank,
      attackMechanizedInfantry
    )
  );
});

app.post("/api/bombard-territory", (req, res) => {
  const userIp = req.ip; // Get userIp from request
  const { targetCountryName } = req.body;
  res.json(gameLogic.bombardTerritory(userIp, targetCountryName));
});

app.post("/api/transfer-resources", (req, res) => {
  const userIp = req.ip; // Get userIp from request
  const { toNationName, type, amount } = req.body;
  res.json(
    gameLogic.transferResourcesByName(userIp, toNationName, type, amount)
  );
});

app.post("/api/spy-nation", (req, res) => {
  const userIp = req.ip; // Get userIp from request
  const { targetNationName } = req.body;
  res.json(gameLogic.spyNation(userIp, targetNationName));
});

app.post("/api/transfer-territory", (req, res) => {
  const userIp = req.ip; // Get userIp from request
  const { targetNationName, territoryName } = req.body;
  res.json(
    gameLogic.transferTerritory(userIp, targetNationName, territoryName)
  );
});

app.post("/api/launch-missile", (req, res) => {
  const userIp = req.ip; // Get userIp from request
  const { targetCountryName } = req.body;
  res.json(gameLogic.launchMissile(userIp, targetCountryName));
});

app.post("/api/post-chat-message", (req, res) => {
  const userIp = req.ip; // Get userIp from request
  const { message } = req.body;
  res.json(gameLogic.postChatMessage(userIp, message));
});

app.post("/api/update-user-activity", (req, res) => {
  const userIp = req.ip; // Get userIp from request
  gameLogic.updateUserActivity(userIp); // This function doesn't return a value
  res.json({ success: true });
});

app.post("/api/start-focus", (req, res) => {
  const userIp = req.ip; // Get userIp from request
  const { focusId } = req.body;
  res.json(gameLogic.startNationalFocus(userIp, focusId));
});

app.post("/api/reset-focus", (req, res) => {
  const userIp = req.ip; // Get userIp from request
  res.json(gameLogic.resetNationalFocus(userIp));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  scheduler.startSchedulers(); // Start game logic schedulers
});
