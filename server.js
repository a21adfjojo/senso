// server.js
const express = require("express");
const path = require("path");
const cors = require("cors");
const gameLogic = require("./gameLogic");
const scheduler = require("./scheduler");
const data = require("./data");

const app = express();
const PORT = process.env.PORT || 3000;

// Renderなどのプロキシ環境でIP取得を正しくする
app.set("trust proxy", 1);

// IP取得関数
const getClientIp = (req) => {
  return req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip;
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// --- API Endpoints ---

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
  const userIp = getClientIp(req);
  res.json(gameLogic.getAlliances(userIp));
});

app.get("/api/online-users", (req, res) => {
  res.json({ success: true, onlineUsers: gameLogic.getOnlineUserNames() });
});

app.get("/api/available-focuses", (req, res) => {
  const userIp = getClientIp(req);
  res.json(gameLogic.getAvailableNationalFocuses(userIp));
});

// Game actions (POST)
app.post("/api/register-nation", (req, res) => {
  const userIp = getClientIp(req);
  const { nationName, countryName } = req.body;
  res.json(gameLogic.registerNation(userIp, nationName, countryName));
});

app.post("/api/buy-territory", (req, res) => {
  const userIp = getClientIp(req);
  const { countryName } = req.body;
  res.json(gameLogic.buyTerritory(userIp, countryName));
});

app.post("/api/reinforce-army", (req, res) => {
  const userIp = getClientIp(req);
  const { type, amount } = req.body;
  res.json(gameLogic.reinforceArmy(userIp, type, amount));
});

app.post("/api/deploy-army", (req, res) => {
  const userIp = getClientIp(req);
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
  const userIp = getClientIp(req);
  res.json(gameLogic.autoDeployArmy(userIp));
});

app.post("/api/request-alliance", (req, res) => {
  const userIp = getClientIp(req);
  const { targetNationName } = req.body;
  res.json(gameLogic.requestAlliance(userIp, targetNationName));
});

app.post("/api/respond-to-alliance", (req, res) => {
  const userIp = getClientIp(req);
  const { requesterIp, response } = req.body;
  res.json(gameLogic.respondToAllianceRequest(userIp, requesterIp, response));
});

app.post("/api/dissolve-alliance", (req, res) => {
  const userIp = getClientIp(req);
  const { alliedNationIp } = req.body;
  res.json(gameLogic.dissolveAlliance(userIp, alliedNationIp));
});

app.post("/api/attack-territory", (req, res) => {
  const userIp = getClientIp(req);
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
  const userIp = getClientIp(req);
  const { targetCountryName } = req.body;
  res.json(gameLogic.bombardTerritory(userIp, targetCountryName));
});

app.post("/api/transfer-resources", (req, res) => {
  const userIp = getClientIp(req);
  const { toNationName, type, amount } = req.body;
  res.json(
    gameLogic.transferResourcesByName(userIp, toNationName, type, amount)
  );
});

app.post("/api/spy-nation", (req, res) => {
  const userIp = getClientIp(req);
  const { targetNationName } = req.body;
  res.json(gameLogic.spyNation(userIp, targetNationName));
});

app.post("/api/transfer-territory", (req, res) => {
  const userIp = getClientIp(req);
  const { targetNationName, territoryName } = req.body;
  res.json(
    gameLogic.transferTerritory(userIp, targetNationName, territoryName)
  );
});

app.post("/api/launch-missile", (req, res) => {
  const userIp = getClientIp(req);
  const { targetCountryName } = req.body;
  res.json(gameLogic.launchMissile(userIp, targetCountryName));
});

app.post("/api/post-chat-message", (req, res) => {
  const userIp = getClientIp(req);
  const { message } = req.body;
  res.json(gameLogic.postChatMessage(userIp, message));
});

app.post("/api/update-user-activity", (req, res) => {
  const userIp = getClientIp(req);
  gameLogic.updateUserActivity(userIp);
  res.json({ success: true });
});

app.post("/api/start-focus", (req, res) => {
  const userIp = getClientIp(req);
  const { focusId } = req.body;
  res.json(gameLogic.startNationalFocus(userIp, focusId));
});

app.post("/api/reset-focus", (req, res) => {
  const userIp = getClientIp(req);
  res.json(gameLogic.resetNationalFocus(userIp));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  scheduler.startSchedulers();
});
