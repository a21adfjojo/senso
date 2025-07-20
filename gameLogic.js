// gameLogic.js
const { v4: uuidv4 } = require("uuid");
const data = require("./data");
const {
  PURCHASE_PRICE,
  INFANTRY_COST,
  TANK_COST,
  MECHANIZED_INFANTRY_COST,
  BOMBER_COST,
  MISSILE_COST,
  INFANTRY_OIL_COST,
  INFANTRY_IRON_COST,
  TANK_OIL_COST,
  TANK_IRON_COST,
  MECHANIZED_INFANTRY_OIL_COST,
  MECHANIZED_INFANTRY_IRON_COST,
  BOMBER_OIL_COST,
  BOMBER_IRON_COST,
  MISSILE_OIL_COST,
  MISSILE_IRON_COST,
  INFANTRY_POWER,
  TANK_POWER,
  MECHANIZED_INFANTRY_POWER,
  BOMBER_INFANTRY_DESTRUCTION_RATE,
  BOMBER_TANK_DESTRUCTION_RATE,
  BOMBER_MECH_DESTRUCTION_RATE,
  TERRITORY_RESOURCES,
  NATIONAL_FOCUSES,
} = require("./constants");

// --- Helper Functions (adapted from GAS Utilities) ---
function addNews(message) {
  if (message.includes("増強しました")) {
    return;
  }
  const newsLog = data.getAllNewsLog();
  newsLog.push({ timestamp: new Date().toISOString(), message: message });
  // Keep only the last 50 news items
  if (newsLog.length > 50) {
    newsLog.splice(0, newsLog.length - 50);
  }
  data.setAllNewsLog(newsLog);
}

function getTerritoryResourceProduction(countryName) {
  return TERRITORY_RESOURCES[countryName] || { oil: 0, iron: 0 };
}

function removeNationsWithoutTerritories() {
  let nations = data.getAllNations();
  const initialNationCount = nations.length;
  let updatedNations = nations.filter((nation) => {
    const territories = nation.territories;
    const population = nation.population;
    const shouldRemove =
      !territories || territories.length === 0 || population <= 0;
    if (shouldRemove && nation.name) {
      addNews(`${nation.name}は滅亡しました。`);
    }
    return !shouldRemove;
  });

  if (updatedNations.length !== initialNationCount) {
    data.setAllNations(updatedNations);
    // Also clean up army deployments for removed nations
    let armyDeployment = data.getAllArmyDeployment();
    const activeNationIps = new Set(updatedNations.map((n) => n.owner)); // Changed from email to IP
    let updatedArmyDeployment = armyDeployment.filter((ad) =>
      activeNationIps.has(ad.owner)
    ); // Changed from email to IP
    data.setAllArmyDeployment(updatedArmyDeployment);
  }
}

// --- Game Action Functions ---

function getNations() {
  const nations = data.getAllNations();
  return nations.filter((nation) => nation.territories.length > 0);
}

function getArmyDeployment() {
  return data.getAllArmyDeployment();
}

function getLatestNews() {
  const newsLog = data.getAllNewsLog();
  // Sort by timestamp descending and get last 5
  return newsLog
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5)
    .map(
      (item) =>
        `[${new Date(item.timestamp).toLocaleTimeString("ja-JP", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}] ${item.message}`
    );
}

function registerNation(userIp, nationName, countryName) {
  // Changed userEmail to userIp
  let nations = data.getAllNations();

  if (!userIp)
    return { success: false, message: "IPアドレスが取得できませんでした。" }; // Changed message

  if (nations.some((n) => n.owner === userIp)) {
    // Changed from email to IP
    return {
      success: false,
      message: "あなたはすでに国を持っているため登録できません。",
    };
  }
  if (nations.some((n) => n.territories.includes(countryName))) {
    return { success: false, message: "その国はすでに登録されています。" };
  }

  const id = uuidv4();
  const color =
    "#" +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0");

  const newNation = {
    id: id,
    name: nationName,
    color: color,
    infantry: 100,
    tank: 20,
    mechanizedInfantry: 0,
    bomber: 0,
    money: 10000,
    population: 10000,
    territories: [countryName],
    owner: userIp, // Changed to IP
    missile: 0,
    oil: 0,
    iron: 0,
    activeFocusId: "",
    focusTurnsRemaining: 0,
    completedFocuses: [],
  };

  nations.push(newNation);
  data.setAllNations(nations);
  addNews(`${nationName}国が建国されました！`);
  return { success: true, id: id };
}

function buyTerritory(userIp, countryName) {
  // Changed userEmail to userIp
  let nations = data.getAllNations();

  if (!userIp)
    return { success: false, message: "IPアドレスが取得できませんでした。" }; // Changed message

  let userNation = nations.find((n) => n.owner === userIp); // Changed from email to IP
  if (!userNation)
    return { success: false, message: "あなたはまだ国を持っていません。" };

  if (userNation.money < PURCHASE_PRICE)
    return {
      success: false,
      message: `お金が足りません。(必要: ${PURCHASE_PRICE})`,
    };

  if (nations.some((n) => n.territories.includes(countryName))) {
    return { success: false, message: "その領土はすでに所有されています。" };
  }

  userNation.money -= PURCHASE_PRICE;
  userNation.territories.push(countryName);
  userNation.population += 1000;

  data.setAllNations(nations);
  addNews(`${userNation.name} が ${countryName} を購入しました`);
  return { success: true, newMoney: userNation.money };
}

function reinforceArmy(userIp, type, amount) {
  // Changed userEmail to userIp
  let nations = data.getAllNations();

  if (!userIp)
    return { success: false, message: "IPアドレスが取得できませんでした。" }; // Changed message

  amount = parseInt(amount, 10);
  if (isNaN(amount) || amount <= 0) {
    return { success: false, message: "正しい数量を入力してください。" };
  }

  let userNation = nations.find((n) => n.owner === userIp); // Changed from email to IP
  if (!userNation) {
    return { success: false, message: "あなたの国が見つかりません。" };
  }

  let cost = 0;
  let oilCost = 0;
  let ironCost = 0;

  const completedFocuses = userNation.completedFocuses || [];
  let missileCostReduction = 0;
  let bomberCostReduction = 0;

  completedFocuses.forEach((focusId) => {
    const focus = NATIONAL_FOCUSES[focusId];
    if (focus && focus.effects) {
      if (focus.effects.missileCostReduction) {
        missileCostReduction += focus.effects.missileCostReduction;
      }
      if (focus.effects.bomberCostReduction) {
        bomberCostReduction += focus.effects.bomberCostReduction;
      }
    }
  });

  switch (type) {
    case "infantry":
      cost = INFANTRY_COST;
      oilCost = INFANTRY_OIL_COST;
      ironCost = INFANTRY_IRON_COST;
      userNation.infantry += amount;
      break;
    case "tank":
      cost = TANK_COST;
      oilCost = TANK_OIL_COST;
      ironCost = TANK_IRON_COST;
      userNation.tank += amount;
      break;
    case "mechanizedInfantry":
      cost = MECHANIZED_INFANTRY_COST;
      oilCost = MECHANIZED_INFANTRY_OIL_COST;
      ironCost = MECHANIZED_INFANTRY_IRON_COST;
      userNation.mechanizedInfantry += amount;
      break;
    case "bomber":
      cost = BOMBER_COST;
      oilCost = BOMBER_OIL_COST;
      ironCost = BOMBER_IRON_COST;
      userNation.bomber += amount;
      cost = Math.max(1, Math.floor(cost * (1 - bomberCostReduction)));
      break;
    case "missile":
      cost = MISSILE_COST;
      oilCost = MISSILE_OIL_COST;
      ironCost = MISSILE_IRON_COST;
      userNation.missile += amount;
      cost = Math.max(1, Math.floor(cost * (1 - missileCostReduction)));
      break;
    default:
      return { success: false, message: "不明な兵器タイプです。" };
  }

  const totalCost = cost * amount;
  const totalOilCost = oilCost * amount;
  const totalIronCost = ironCost * amount;

  if (userNation.money < totalCost) {
    return {
      success: false,
      message: `お金が足りません。(必要: ${totalCost}円)`,
    };
  }
  if (userNation.oil < totalOilCost) {
    return {
      success: false,
      message: `石油が足りません。(必要: ${totalOilCost}石油)`,
    };
  }
  if (userNation.iron < totalIronCost) {
    return {
      success: false,
      message: `鉄が足りません。(必要: ${totalIronCost}鉄)`,
    };
  }

  userNation.money -= totalCost;
  userNation.oil -= totalOilCost;
  userNation.iron -= totalIronCost;

  data.setAllNations(nations);
  addNews(`${userNation.name} が ${type} を ${amount} 個増強しました。`);
  return {
    success: true,
    message: `${type} を ${amount} 個購入しました。残りのお金: ${userNation.money}円, 石油: ${userNation.oil}, 鉄: ${userNation.iron}`,
  };
}

function deployArmy(userIp, countryName, infantry, tank, mechanizedInfantry) {
  // Changed userEmail to userIp
  let nations = data.getAllNations();
  let armyDeployment = data.getAllArmyDeployment();

  if (!userIp)
    return { success: false, message: "IPアドレスが取得できませんでした。" }; // Changed message

  infantry = parseInt(infantry, 10);
  tank = parseInt(tank, 10);
  mechanizedInfantry = parseInt(mechanizedInfantry, 10);
  if (
    isNaN(infantry) ||
    isNaN(tank) ||
    isNaN(mechanizedInfantry) ||
    infantry < 0 ||
    tank < 0 ||
    mechanizedInfantry < 0
  ) {
    return { success: false, message: "正しい数値を入力してください。" };
  }

  let userNation = nations.find((n) => n.owner === userIp); // Changed from email to IP
  if (!userNation)
    return { success: false, message: "あなたの国が見つかりません。" };

  // Calculate currently deployed units by the user
  let usedInfantry = 0,
    usedTank = 0,
    usedMechInf = 0;
  armyDeployment.forEach((ad) => {
    if (ad.owner === userIp && ad.countryCode !== countryName) {
      // Changed from email to IP
      usedInfantry += ad.infantry;
      usedTank += ad.tank;
      usedMechInf += ad.mechanizedInfantry;
    }
  });

  if (
    infantry + usedInfantry > userNation.infantry ||
    tank + usedTank > userNation.tank ||
    mechanizedInfantry + usedMechInf > userNation.mechanizedInfantry
  ) {
    return { success: false, message: "手持ちの兵力が足りません。" };
  }

  let targetDeployment = armyDeployment.find(
    (ad) => ad.owner === userIp && ad.countryCode === countryName
  ); // Changed from email to IP

  if (targetDeployment) {
    targetDeployment.infantry = infantry;
    targetDeployment.tank = tank;
    targetDeployment.mechanizedInfantry = mechanizedInfantry;
  } else {
    armyDeployment.push({
      countryCode: countryName,
      owner: userIp, // Changed to IP
      infantry: infantry,
      tank: tank,
      mechanizedInfantry: mechanizedInfantry,
    });
  }

  data.setAllArmyDeployment(armyDeployment);
  return {
    success: true,
    message: `軍を配置しました（歩兵${infantry}, 戦車${tank}, 機械化歩兵${mechanizedInfantry}）`,
  };
}

function autoDeployArmy(userIp) {
  // Changed userEmail to userIp
  let nations = data.getAllNations();
  let armyDeployment = data.getAllArmyDeployment();

  if (!userIp)
    return { success: false, message: "IPアドレスが取得できませんでした。" }; // Changed message

  let myNation = nations.find((n) => n.owner === userIp); // Changed from email to IP
  if (!myNation) return { success: false, message: "自国が見つかりません。" };
  if (myNation.territories.length === 0)
    return { success: false, message: "領土がありません。" };

  const territories = myNation.territories;
  const numTerritories = territories.length;

  let infantryPer = Math.floor(myNation.infantry / numTerritories);
  let tankPer = Math.floor(myNation.tank / numTerritories);
  let mechInfPer = Math.floor(myNation.mechanizedInfantry / numTerritories);

  let infantryLeft = myNation.infantry % numTerritories;
  let tankLeft = myNation.tank % numTerritories;
  let mechInfLeft = myNation.mechanizedInfantry % numTerritories;

  // Remove existing deployments for this user
  armyDeployment = armyDeployment.filter((ad) => ad.owner !== userIp); // Changed from email to IP

  territories.forEach((countryName) => {
    let inf = infantryPer + (infantryLeft-- > 0 ? 1 : 0);
    let tank = tankPer + (tankLeft-- > 0 ? 1 : 0);
    let mechInf = mechInfPer + (mechInfLeft-- > 0 ? 1 : 0);

    armyDeployment.push({
      countryCode: countryName,
      owner: userIp, // Changed to IP
      infantry: inf,
      tank: tank,
      mechanizedInfantry: mechInf,
    });
  });

  data.setAllArmyDeployment(armyDeployment);
  return { success: true, message: "兵力を自国の領土に均等配置しました。" };
}

function requestAlliance(userIp, targetNationName) {
  // Changed userEmail to userIp
  let nations = data.getAllNations();
  let alliances = data.getAllAlliances();

  if (!userIp)
    return { success: false, message: "IPアドレスが取得できませんでした。" }; // Changed message

  let requesterNation = nations.find((n) => n.owner === userIp); // Changed from email to IP
  let approverNation = nations.find((n) => n.name === targetNationName);

  if (!requesterNation)
    return { success: false, message: "あなたの国が見つかりません。" };
  if (!approverNation)
    return { success: false, message: "同盟申請先の国が見つかりません。" };
  if (requesterNation.owner === approverNation.owner)
    return {
      success: false,
      message: "自分自身と同盟を組むことはできません。",
    };

  // Check for existing or pending alliances
  for (const alliance of alliances) {
    const existingRequesterIp = alliance.requesterIp; // Changed from Email to Ip
    const existingApproverIp = alliance.approverIp; // Changed from Email to Ip
    const status = alliance.status;

    if (
      status === "Approved" &&
      ((existingRequesterIp === requesterNation.owner &&
        existingApproverIp === approverNation.owner) ||
        (existingRequesterIp === approverNation.owner &&
          existingApproverIp === requesterNation.owner))
    ) {
      return {
        success: false,
        message: `${targetNationName}とはすでに同盟関係にあります。`,
      };
    }
    if (
      status === "Pending" &&
      existingRequesterIp === requesterNation.owner &&
      existingApproverIp === approverNation.owner
    ) {
      return {
        success: false,
        message: `${targetNationName}への同盟申請はすでに送信済みです。`,
      };
    }
    if (
      status === "Pending" &&
      existingRequesterIp === approverNation.owner &&
      existingApproverIp === requesterNation.owner
    ) {
      return {
        success: false,
        message: `${targetNationName}からあなたへの同盟申請がすでにあります。そちらを承認してください。`,
      };
    }
  }

  alliances.push({
    requesterIp: requesterNation.owner, // Changed to Ip
    requesterNationName: requesterNation.name,
    approverIp: approverNation.owner, // Changed to Ip
    approverNationName: approverNation.name,
    status: "Pending",
    timestamp: new Date().toISOString(),
  });
  data.setAllAlliances(alliances);
  addNews(
    `${requesterNation.name}が${approverNation.name}に同盟を申請しました。`
  );
  return {
    success: true,
    message: `${targetNationName}に同盟申請を送信しました。`,
  };
}

function respondToAllianceRequest(userIp, requesterIp, response) {
  // Changed userEmail/requesterEmail to userIp/requesterIp
  let alliances = data.getAllAlliances();

  if (!userIp)
    return { success: false, message: "IPアドレスが取得できませんでした。" }; // Changed message

  let requestFound = false;
  for (let i = 0; i < alliances.length; i++) {
    const alliance = alliances[i];
    if (
      alliance.requesterIp === requesterIp &&
      alliance.approverIp === userIp &&
      alliance.status === "Pending"
    ) {
      // Changed to Ip
      requestFound = true;
      if (response === "approve") {
        alliance.status = "Approved";
        data.setAllAlliances(alliances);
        addNews(
          `${alliance.approverNationName}が${alliance.requesterNationName}との同盟を承認しました！`
        );
        return {
          success: true,
          message: `${alliance.requesterNationName}との同盟を承認しました。`,
        };
      } else if (response === "reject") {
        alliances.splice(i, 1); // Remove the request
        data.setAllAlliances(alliances);
        addNews(
          `${alliance.approverNationName}が${alliance.requesterNationName}との同盟を拒否しました。`
        );
        return {
          success: true,
          message: `${alliance.requesterNationName}との同盟を拒否しました。`,
        };
      }
    }
  }
  if (!requestFound) {
    return { success: false, message: "該当する同盟申請が見つかりません。" };
  }
  return { success: false, message: "不明なエラーが発生しました。" };
}

function dissolveAlliance(userIp, alliedNationIp) {
  // Changed userEmail/alliedNationEmail to userIp/alliedNationIp
  let alliances = data.getAllAlliances();

  if (!userIp)
    return { success: false, message: "IPアドレスが取得できませんでした。" }; // Changed message

  let allianceFoundAndDissolved = false;
  let dissolvedNationName = "";
  let dissolvedPartnerName = "";

  for (let i = 0; i < alliances.length; i++) {
    const alliance = alliances[i];
    if (
      alliance.status === "Approved" &&
      ((alliance.requesterIp === userIp &&
        alliance.approverIp === alliedNationIp) || // Changed to Ip
        (alliance.approverIp === userIp &&
          alliance.requesterIp === alliedNationIp))
    ) {
      // Changed to Ip

      if (alliance.requesterIp === userIp) {
        // Changed to Ip
        dissolvedNationName = alliance.requesterNationName;
        dissolvedPartnerName = alliance.approverNationName;
      } else {
        dissolvedNationName = alliance.approverNationName;
        dissolvedPartnerName = alliance.requesterNationName;
      }

      alliances.splice(i, 1); // Remove the alliance
      allianceFoundAndDissolved = true;
      break;
    }
  }

  if (allianceFoundAndDissolved) {
    data.setAllAlliances(alliances);
    addNews(
      `${dissolvedNationName}が${dissolvedPartnerName}との同盟を解除しました。`
    );
    return {
      success: true,
      message: `${dissolvedPartnerName}との同盟を解除しました。`,
    };
  } else {
    return { success: false, message: "該当する同盟が見つかりません。" };
  }
}

function getAlliances(userIp) {
  // Changed userEmail to userIp
  const alliances = data.getAllAlliances();
  if (!userIp) return { pendingRequests: [], approvedAlliances: [] };

  const pendingRequests = [];
  const approvedAlliances = [];

  for (const alliance of alliances) {
    const requesterIp = alliance.requesterIp; // Changed to Ip
    const requesterNationName = alliance.requesterNationName;
    const approverIp = alliance.approverIp; // Changed to Ip
    const approverNationName = alliance.approverNationName;
    const status = alliance.status;

    if (status === "Pending" && approverIp === userIp) {
      // Changed to Ip
      pendingRequests.push({
        requesterIp: requesterIp, // Changed to Ip
        requesterNationName: requesterNationName,
      });
    } else if (
      status === "Approved" &&
      (requesterIp === userIp || approverIp === userIp)
    ) {
      // Changed to Ip
      const alliedNationName =
        requesterIp === userIp ? approverNationName : requesterNationName; // Changed to Ip
      approvedAlliances.push({
        nationName: alliedNationName,
        ip: requesterIp === userIp ? approverIp : requesterIp, // Changed email to ip
      });
    }
  }
  return {
    pendingRequests: pendingRequests,
    approvedAlliances: approvedAlliances,
  };
}

function attackTerritory(
  userIp,
  targetCountryName,
  attackInfantry,
  attackTank,
  attackMechanizedInfantry
) {
  // Changed userEmail to userIp
  let nations = data.getAllNations();
  let armyDeployment = data.getAllArmyDeployment();

  if (!userIp)
    return { success: false, message: "IPアドレスが取得できませんでした。" }; // Changed message

  attackInfantry = parseInt(attackInfantry, 10);
  attackTank = parseInt(attackTank, 10);
  attackMechanizedInfantry = parseInt(attackMechanizedInfantry, 10);

  let attackerNation = nations.find((n) => n.owner === userIp); // Changed from email to IP
  let defenderNation = nations.find((n) =>
    n.territories.includes(targetCountryName)
  );

  if (!attackerNation || !defenderNation)
    return { success: false, message: "攻撃側または防衛側が見つかりません。" };
  if (attackerNation.owner === defenderNation.owner)
    return { success: false, message: "自分の国に攻撃することはできません。" };

  // Alliance Check
  const alliances = data.getAllAlliances();
  for (const alliance of alliances) {
    if (
      alliance.status === "Approved" &&
      ((alliance.requesterIp === attackerNation.owner &&
        alliance.approverIp === defenderNation.owner) || // Changed to Ip
        (alliance.requesterIp === defenderNation.owner &&
          alliance.approverIp === attackerNation.owner))
    ) {
      // Changed to Ip
      return { success: false, message: "同盟国を攻撃することはできません。" };
    }
  }

  if (
    attackerNation.infantry < attackInfantry ||
    attackerNation.tank < attackTank ||
    attackerNation.mechanizedInfantry < attackMechanizedInfantry
  ) {
    return { success: false, message: "指定した兵力が足りません。" };
  }

  let dInfPer = 0,
    dTankPer = 0,
    dMechInfPer = 0;
  const defenderDeployment = armyDeployment.find(
    (ad) =>
      ad.countryCode === targetCountryName && ad.owner === defenderNation.owner
  );
  if (defenderDeployment) {
    dInfPer = defenderDeployment.infantry;
    dTankPer = defenderDeployment.tank;
    dMechInfPer = defenderDeployment.mechanizedInfantry;
  }

  const attackerCompletedFocuses = attackerNation.completedFocuses || [];
  let infantryPowerBonus = 0;
  let tankPowerBonus = 0;
  let mechanizedInfantryPowerBonus = 0;

  attackerCompletedFocuses.forEach((focusId) => {
    const focus = NATIONAL_FOCUSES[focusId];
    if (focus && focus.effects) {
      if (focus.effects.infantryPowerBonus)
        infantryPowerBonus += focus.effects.infantryPowerBonus;
      if (focus.effects.tankPowerBonus)
        tankPowerBonus += focus.effects.tankPowerBonus;
      if (focus.effects.mechanizedInfantryPowerBonus)
        mechanizedInfantryPowerBonus +=
          focus.effects.mechanizedInfantryPowerBonus;
    }
  });

  const defenderCompletedFocuses = defenderNation.completedFocuses || [];
  let defenseBonusIncrease = 0;
  defenderCompletedFocuses.forEach((focusId) => {
    const focus = NATIONAL_FOCUSES[focusId];
    if (focus && focus.effects && focus.effects.defenseBonusIncrease) {
      defenseBonusIncrease += focus.effects.defenseBonusIncrease;
    }
  });

  const effectiveInfantryPower = INFANTRY_POWER + infantryPowerBonus;
  const effectiveTankPower = TANK_POWER + tankPowerBonus;
  const effectiveMechanizedInfantryPower =
    MECHANIZED_INFANTRY_POWER + mechanizedInfantryPowerBonus;

  const attackPower =
    attackInfantry * effectiveInfantryPower +
    attackTank * effectiveTankPower +
    attackMechanizedInfantry * effectiveMechanizedInfantryPower;

  const currentDefenseBonus = 1.2;
  const totalDefenseBonus = currentDefenseBonus + defenseBonusIncrease;

  const defensePower =
    (dInfPer * INFANTRY_POWER +
      dTankPer * TANK_POWER +
      dMechInfPer * MECHANIZED_INFANTRY_POWER) *
    totalDefenseBonus;

  let result = "",
    attackerLossRate = 0,
    defenderLossRate = 0;

  if (attackPower > defensePower * 1.5) {
    result = "占領";
    attackerLossRate = 0.2;
    defenderLossRate = 0.8;
    addNews(
      `${attackerNation.name} が ${defenderNation.name} の ${targetCountryName} を占領！`
    );
  } else if (attackPower > defensePower) {
    result = "優勢";
    attackerLossRate = 0.5;
    defenderLossRate = 0.6;
    addNews(
      `${attackerNation.name} が ${defenderNation.name} の ${targetCountryName} を攻撃（${result}）`
    );
  } else {
    result = "劣勢";
    attackerLossRate = 0.8;
    defenderLossRate = 0.2;
    addNews(
      `${attackerNation.name} が ${defenderNation.name} の ${targetCountryName} を攻撃（${result}）`
    );
  }

  // Calculate losses
  const attackerInfLoss = Math.floor(attackInfantry * attackerLossRate);
  const attackerTankLoss = Math.floor(attackTank * attackerLossRate);
  const attackerMechInfLoss = Math.floor(
    attackMechanizedInfantry * attackerLossRate
  );
  const defenderInfLoss = Math.floor(dInfPer * defenderLossRate);
  const defenderTankLoss = Math.floor(dTankPer * defenderLossRate);
  const defenderMechInfLoss = Math.floor(dMechInfPer * defenderLossRate);

  // Update attacker's units
  attackerNation.infantry = Math.max(
    0,
    attackerNation.infantry - attackerInfLoss
  );
  attackerNation.tank = Math.max(0, attackerNation.tank - attackerTankLoss);
  attackerNation.mechanizedInfantry = Math.max(
    0,
    attackerNation.mechanizedInfantry - attackerMechInfLoss
  );

  // Update defender's total units
  defenderNation.infantry = Math.max(
    0,
    defenderNation.infantry - defenderInfLoss
  );
  defenderNation.tank = Math.max(0, defenderNation.tank - defenderTankLoss);
  defenderNation.mechanizedInfantry = Math.max(
    0,
    defenderNation.mechanizedInfantry - defenderMechInfLoss
  );

  // Update defender's deployed units in the specific territory
  if (defenderDeployment) {
    defenderDeployment.infantry = Math.max(
      0,
      defenderDeployment.infantry - defenderInfLoss
    );
    defenderDeployment.tank = Math.max(
      0,
      defenderDeployment.tank - defenderTankLoss
    );
    defenderDeployment.mechanizedInfantry = Math.max(
      0,
      defenderDeployment.mechanizedInfantry - defenderMechInfLoss
    );
  }

  if (result === "占領") {
    // Transfer territory
    defenderNation.territories = defenderNation.territories.filter(
      (name) => name !== targetCountryName
    );
    attackerNation.territories.push(targetCountryName);

    // Population transfer
    defenderNation.population = Math.max(0, defenderNation.population - 1000);
    attackerNation.population = (attackerNation.population || 0) + 1000;

    // Remove defender's army deployment for the captured territory
    armyDeployment = armyDeployment.filter(
      (ad) =>
        !(
          ad.countryCode === targetCountryName &&
          ad.owner === defenderNation.owner
        )
    );
  }

  data.setAllNations(nations);
  data.setAllArmyDeployment(armyDeployment);
  removeNationsWithoutTerritories(); // Check for eliminated nations

  return {
    success: true,
    result: result,
    message: `戦闘結果：${result}\n攻撃側損害: 歩兵${attackerInfLoss}, 戦車${attackerTankLoss}, 機械化歩兵${attackerMechInfLoss}\n防衛側損害: 歩兵${defenderInfLoss}, 戦車${defenderTankLoss}, 機械化歩兵${defenderMechInfLoss}`,
  };
}

function bombardTerritory(userIp, targetCountryName) {
  // Changed userEmail to userIp
  let nations = data.getAllNations();
  let armyDeployment = data.getAllArmyDeployment();

  if (!userIp)
    return { success: false, message: "IPアドレスが取得できませんでした。" }; // Changed message

  let attackerNation = nations.find((n) => n.owner === userIp); // Changed from email to IP
  let defenderNation = nations.find((n) =>
    n.territories.includes(targetCountryName)
  );

  if (!attackerNation)
    return { success: false, message: "自国が見つかりません。" };
  if (!defenderNation)
    return { success: false, message: "目標の国が見つかりません。" };
  if (attackerNation.owner === defenderNation.owner)
    return { success: false, message: "自国を爆撃することはできません。" };

  if (attackerNation.bomber < 1)
    return { success: false, message: "爆撃機を所有していません。" };

  let defenderDeployment = armyDeployment.find(
    (ad) =>
      ad.countryCode === targetCountryName && ad.owner === defenderNation.owner
  );

  if (
    !defenderDeployment ||
    (defenderDeployment.infantry === 0 &&
      defenderDeployment.tank === 0 &&
      defenderDeployment.mechanizedInfantry === 0)
  ) {
    return { success: false, message: "目標領土に防衛部隊がいません。" };
  }

  const infLoss = Math.floor(
    defenderDeployment.infantry * BOMBER_INFANTRY_DESTRUCTION_RATE
  );
  const tankLoss = Math.floor(
    defenderDeployment.tank * BOMBER_TANK_DESTRUCTION_RATE
  );
  const mechInfLoss = Math.floor(
    defenderDeployment.mechanizedInfantry * BOMBER_MECH_DESTRUCTION_RATE
  );

  // Update defender's total units
  defenderNation.infantry = Math.max(0, defenderNation.infantry - infLoss);
  defenderNation.tank = Math.max(0, defenderNation.tank - tankLoss);
  defenderNation.mechanizedInfantry = Math.max(
    0,
    defenderNation.mechanizedInfantry - mechInfLoss
  );

  // Update defender's deployed units
  defenderDeployment.infantry = Math.max(
    0,
    defenderDeployment.infantry - infLoss
  );
  defenderDeployment.tank = Math.max(0, defenderDeployment.tank - tankLoss);
  defenderDeployment.mechanizedInfantry = Math.max(
    0,
    defenderDeployment.mechanizedInfantry - mechInfLoss
  );

  // Consume one bomber
  attackerNation.bomber--;

  data.setAllNations(nations);
  data.setAllArmyDeployment(armyDeployment);

  const message = `${attackerNation.name}が${defenderNation.name}の${targetCountryName}を爆撃！ 防衛軍に損害を与えた。(損害: 歩兵${infLoss}, 戦車${tankLoss}, 機械化歩兵${mechInfLoss})`;
  addNews(message);

  return { success: true, message: message };
}

function transferResourcesByName(userIp, toNationName, type, amount) {
  // Changed userEmail to userIp
  let nations = data.getAllNations();

  if (!userIp)
    return { success: false, message: "IPアドレスが取得できませんでした。" }; // Changed message

  amount = parseInt(amount, 10);
  if (isNaN(amount) || amount <= 0)
    return { success: false, message: "正しい数値を入力してください。" };

  let senderNation = nations.find((n) => n.owner === userIp); // Changed from email to IP
  let receiverNation = nations.find((n) => n.name === toNationName);

  if (!senderNation)
    return { success: false, message: "自国が見つかりません。" };
  if (!receiverNation)
    return { success: false, message: "相手の国が見つかりません。" };
  if (senderNation.owner === receiverNation.owner)
    return { success: false, message: "自国に送ることはできません。" };

  let typeName = "",
    senderHas = 0;

  switch (type) {
    case "money":
      typeName = "円";
      senderHas = senderNation.money;
      if (senderHas < amount)
        return { success: false, message: `${typeName}が足りません。` };
      senderNation.money -= amount;
      receiverNation.money += amount;
      break;
    case "infantry":
      typeName = "歩兵";
      senderHas = senderNation.infantry;
      if (senderHas < amount)
        return { success: false, message: `${typeName}が足りません。` };
      senderNation.infantry -= amount;
      receiverNation.infantry += amount;
      break;
    case "tank":
      typeName = "戦車";
      senderHas = senderNation.tank;
      if (senderHas < amount)
        return { success: false, message: `${typeName}が足りません。` };
      senderNation.tank -= amount;
      receiverNation.tank += amount;
      break;
    case "mechanizedInfantry":
      typeName = "機械化歩兵";
      senderHas = senderNation.mechanizedInfantry;
      if (senderHas < amount)
        return { success: false, message: `${typeName}が足りません。` };
      senderNation.mechanizedInfantry -= amount;
      receiverNation.mechanizedInfantry += amount;
      break;
    case "bomber":
      typeName = "爆撃機";
      senderHas = senderNation.bomber;
      if (senderHas < amount)
        return { success: false, message: `${typeName}が足りません。` };
      senderNation.bomber -= amount;
      receiverNation.bomber += amount;
      break;
    case "missile":
      typeName = "ミサイル";
      senderHas = senderNation.missile;
      if (senderHas < amount)
        return { success: false, message: `${typeName}が足りません。` };
      senderNation.missile -= amount;
      receiverNation.missile += amount;
      break;
    case "oil":
      typeName = "石油";
      senderHas = senderNation.oil;
      if (senderHas < amount)
        return { success: false, message: `${typeName}が足りません。` };
      senderNation.oil -= amount;
      receiverNation.oil += amount;
      break;
    case "iron":
      typeName = "鉄";
      senderHas = senderNation.iron;
      if (senderHas < amount)
        return { success: false, message: `${typeName}が足りません。` };
      senderNation.iron -= amount;
      receiverNation.iron += amount;
      break;
    default:
      return { success: false, message: "不正なタイプです。" };
  }

  data.setAllNations(nations);
  addNews(
    `${senderNation.name} が ${receiverNation.name} に ${amount} ${typeName} を送付`
  );
  return {
    success: true,
    message: `${toNationName} に ${amount} ${typeName} を渡しました。`,
  };
}

function spyNation(userIp, targetNationName) {
  // Changed userEmail to userIp
  let nations = data.getAllNations();

  if (!userIp)
    return { success: false, message: "IPアドレスが取得できませんでした。" }; // Changed message

  let senderNation = nations.find((n) => n.owner === userIp); // Changed from email to IP
  let targetNation = nations.find((n) => n.name === targetNationName);

  if (!senderNation)
    return { success: false, message: "あなたの国が見つかりません。" };
  if (!targetNation)
    return { success: false, message: "対象の国が見つかりません。" };
  if (senderNation.owner === targetNation.owner)
    return { success: false, message: "自国をスパイできません。" };

  if (senderNation.money < 500)
    return { success: false, message: "お金が足りません（500必要）" };

  senderNation.money -= 500;
  data.setAllNations(nations);

  if (Math.random() > 0.5) {
    addNews(
      `${senderNation.name} が ${targetNationName} へのスパイに失敗しました。(500円損失)`
    );
    return {
      success: false,
      message: `スパイに失敗しました。500円を失いました。`,
    };
  }

  const getRangeApproximate = (value, rate = 0.2) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) return "不明";
    return `${Math.floor(numValue * (1 - rate))}~${Math.ceil(
      numValue * (1 + rate)
    )}`;
  };

  return {
    success: true,
    message: `${targetNationName} の情報を入手しました。`,
    info: {
      infantry: getRangeApproximate(targetNation.infantry),
      tank: getRangeApproximate(targetNation.tank),
      mechanizedInfantry: getRangeApproximate(targetNation.mechanizedInfantry),
      bomber: getRangeApproximate(targetNation.bomber),
      money: getRangeApproximate(targetNation.money),
      missile: getRangeApproximate(targetNation.missile),
      oil: getRangeApproximate(targetNation.oil),
      iron: getRangeApproximate(targetNation.iron),
    },
  };
}

function transferTerritory(userIp, targetNationName, territoryName) {
  // Changed userEmail to userIp
  let nations = data.getAllNations();

  if (!userIp)
    return { success: false, message: "IPアドレスが取得できませんでした。" }; // Changed message

  let senderNation = nations.find((n) => n.owner === userIp); // Changed from email to IP
  let receiverNation = nations.find((n) => n.name === targetNationName);

  if (!senderNation)
    return { success: false, message: "自国が見つかりません。" };
  if (!receiverNation)
    return { success: false, message: "相手国が見つかりません。" };
  if (senderNation.owner === receiverNation.owner)
    return { success: false, message: "自分の国に譲渡することはできません。" };

  if (!senderNation.territories.includes(territoryName)) {
    return { success: false, message: "指定された領土を所有していません。" };
  }

  // Move territory
  senderNation.territories = senderNation.territories.filter(
    (name) => name !== territoryName
  );
  receiverNation.territories.push(territoryName);

  // Transfer population
  senderNation.population = Math.max(0, senderNation.population - 1000);
  receiverNation.population = (receiverNation.population || 0) + 1000;

  data.setAllNations(nations);
  addNews(
    `${senderNation.name}が${receiverNation.name}に領土（${territoryName}）を譲渡しました。`
  );

  return {
    success: true,
    message: `${territoryName}を${targetNationName}に譲渡し、人口も1000人移動しました。`,
  };
}

function launchMissile(userIp, targetCountryName) {
  // Changed userEmail to userIp
  let nations = data.getAllNations();
  let armyDeployment = data.getAllArmyDeployment();

  if (!userIp)
    return { success: false, message: "IPアドレスが取得できませんでした。" }; // Changed message

  let attackerNation = nations.find((n) => n.owner === userIp); // Changed from email to IP
  let defenderNation = nations.find((n) =>
    n.territories.includes(targetCountryName)
  );

  if (!attackerNation)
    return { success: false, message: "自国が見つかりません。" };
  if (!defenderNation)
    return { success: false, message: "目標の国が見つかりません。" };
  if (attackerNation.owner === defenderNation.owner)
    return {
      success: false,
      message: "自国領土にミサイルを発射することはできません。",
    };

  if (attackerNation.missile < 1)
    return { success: false, message: "ミサイルを所有していません。" };

  // Consume one missile
  attackerNation.missile--;

  // Population decrease
  const populationLoss = 3000;
  defenderNation.population = Math.max(
    0,
    defenderNation.population - populationLoss
  );

  // Half defense army
  let defenderDeployment = armyDeployment.find(
    (ad) =>
      ad.countryCode === targetCountryName && ad.owner === defenderNation.owner
  );
  let infLoss = 0,
    tankLoss = 0,
    mechInfLoss = 0;

  if (defenderDeployment) {
    infLoss = Math.floor(defenderDeployment.infantry / 2);
    tankLoss = Math.floor(defenderDeployment.tank / 2);
    mechInfLoss = Math.floor(defenderDeployment.mechanizedInfantry / 2);

    defenderDeployment.infantry = Math.max(
      0,
      defenderDeployment.infantry - infLoss
    );
    defenderDeployment.tank = Math.max(0, defenderDeployment.tank - tankLoss);
    defenderDeployment.mechanizedInfantry = Math.max(
      0,
      defenderDeployment.mechanizedInfantry - mechInfLoss
    );
  }

  // Update defender's total units
  defenderNation.infantry = Math.max(0, defenderNation.infantry - infLoss);
  defenderNation.tank = Math.max(0, defenderNation.tank - tankLoss);
  defenderNation.mechanizedInfantry = Math.max(
    0,
    defenderNation.mechanizedInfantry - mechInfLoss
  );

  data.setAllNations(nations);
  data.setAllArmyDeployment(armyDeployment);

  addNews(
    `${attackerNation.name}が${defenderNation.name}の${targetCountryName}にミサイルを発射！`
  );
  addNews(
    `${defenderNation.name}の${targetCountryName}にミサイルが着弾！ 人口${populationLoss}減少し、防衛軍が半壊した。(損害: 歩兵${infLoss}, 戦車${tankLoss}, 機械化歩兵${mechInfLoss})`
  );

  return {
    success: true,
    message: `ミサイルが${targetCountryName}に発射されました。着弾します。`,
  };
}

function getChatMessages() {
  const chatLog = data.getAllChatLog();
  return chatLog.map((msg) => ({
    time: new Date(msg.timestamp).toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    nationName: msg.nationName,
    message: msg.message,
  }));
}

function postChatMessage(userIp, message) {
  // Changed userEmail to userIp
  let nations = data.getAllNations();
  let chatLog = data.getAllChatLog();

  if (!userIp || !message || message.trim() === "") {
    return { success: false, message: "無効なメッセージです。" };
  }

  let nationName = "不明な国";
  const userNation = nations.find((n) => n.owner === userIp); // Changed from email to IP
  if (userNation) {
    nationName = userNation.name;
  }

  chatLog.push({
    timestamp: new Date().toISOString(),
    userIp: userIp,
    nationName: nationName,
    message: message.trim(),
  }); // Changed userEmail to userIp
  // Keep only the last 100 messages
  if (chatLog.length > 100) {
    chatLog.splice(0, chatLog.length - 100);
  }
  data.setAllChatLog(chatLog);

  return { success: true };
}

function addIncomePerMinute() {
  let nations = data.getAllNations();

  nations.forEach((nation) => {
    let population = nation.population || 0;
    let currentMoney = nation.money || 0;
    let completedFocuses = nation.completedFocuses || [];

    let moneyProductionBonus = 0;
    let populationGrowthBonus = 0;

    completedFocuses.forEach((focusId) => {
      const focus = NATIONAL_FOCUSES[focusId];
      if (focus && focus.effects) {
        if (focus.effects.moneyProductionBonus)
          moneyProductionBonus += focus.effects.moneyProductionBonus;
        if (focus.effects.populationGrowthBonus)
          populationGrowthBonus += focus.effects.populationGrowthBonus;
      }
    });

    const baseIncome = Math.floor(population * 0.01);
    const totalIncome = Math.floor(baseIncome * (1 + moneyProductionBonus));

    if (totalIncome > 0) {
      nation.money = currentMoney + totalIncome;
    }

    const basePopulationGrowthRate = 0.0005;
    const totalPopulationGrowthRate =
      basePopulationGrowthRate + populationGrowthBonus;
    const populationGrowth = Math.floor(population * totalPopulationGrowthRate);

    if (populationGrowth > 0) {
      nation.population = population + populationGrowth;
    }
  });
  data.setAllNations(nations);
}

function addResourcesPerMinute() {
  let nations = data.getAllNations();

  nations.forEach((nation) => {
    const territories = nation.territories || [];
    let currentOil = nation.oil || 0;
    let currentIron = nation.iron || 0;
    let completedFocuses = nation.completedFocuses || [];

    let totalOilProduction = 0;
    let totalIronProduction = 0;

    territories.forEach((countryName) => {
      const resource = getTerritoryResourceProduction(countryName);
      totalOilProduction += resource.oil;
      totalIronProduction += resource.iron;
    });

    let oilProductionBonus = 0;
    let ironProductionBonus = 0;
    completedFocuses.forEach((focusId) => {
      const focus = NATIONAL_FOCUSES[focusId];
      if (focus && focus.effects) {
        if (focus.effects.oilProductionBonus)
          oilProductionBonus += focus.effects.oilProductionBonus;
        if (focus.effects.ironProductionBonus)
          ironProductionBonus += focus.effects.ironProductionBonus;
      }
    });

    totalOilProduction = Math.floor(
      totalOilProduction * (1 + oilProductionBonus)
    );
    totalIronProduction = Math.floor(
      totalIronProduction * (1 + ironProductionBonus)
    );

    if (totalOilProduction > 0) {
      nation.oil = currentOil + totalOilProduction;
    }
    if (totalIronProduction > 0) {
      nation.iron = currentIron + totalIronProduction;
    }
  });
  data.setAllNations(nations);
}

function updateUserActivity(userIp) {
  // Changed userEmail to userIp
  let userActivity = data.getAllUserActivity();
  let nations = data.getAllNations();

  if (!userIp) return;

  let nationName = "未登録の国";
  const userNation = nations.find((n) => n.owner === userIp); // Changed from email to IP
  if (userNation) {
    nationName = userNation.name;
  }

  let userEntry = userActivity.find((entry) => entry.userIp === userIp); // Changed from userEmail to userIp
  const currentTime = new Date().toISOString();

  if (userEntry) {
    userEntry.nationName = nationName;
    userEntry.lastSeen = currentTime;
  } else {
    userActivity.push({
      userIp: userIp,
      nationName: nationName,
      lastSeen: currentTime,
    }); // Changed userEmail to userIp
  }
  data.setAllUserActivity(userActivity);
}

function getOnlineUserNames() {
  const userActivity = data.getAllUserActivity();
  const onlineUsers = new Set();
  const thirtySecondsAgo = new Date(Date.now() - 30 * 1000).toISOString();

  userActivity.forEach((entry) => {
    if (entry.lastSeen > thirtySecondsAgo) {
      onlineUsers.add(entry.nationName);
    }
  });
  return Array.from(onlineUsers);
}

function getAvailableNationalFocuses(userIp) {
  // Changed userEmail to userIp
  const nations = data.getAllNations();
  if (!userIp)
    return {
      success: false,
      message: "IPアドレスが取得できませんでした。",
      focuses: [],
    }; // Changed message

  let userNation = nations.find((n) => n.owner === userIp); // Changed from email to IP
  if (!userNation)
    return {
      success: false,
      message: "あなたの国が見つかりません。",
      focuses: [],
    };

  if (userNation.activeFocusId) {
    const activeFocus = NATIONAL_FOCUSES[userNation.activeFocusId];
    return {
      success: true,
      message: "すでに国家方針を実行中です。",
      focuses: [],
      activeFocus: activeFocus,
      focusTurnsRemaining: userNation.focusTurnsRemaining,
    };
  }

  const availableFocuses = [];
  const completedFocuses = userNation.completedFocuses || [];

  for (const id in NATIONAL_FOCUSES) {
    const focus = NATIONAL_FOCUSES[id];
    if (completedFocuses.includes(id)) continue;

    const hasPrerequisites = focus.prerequisites.every((prereqId) =>
      completedFocuses.includes(prereqId)
    );
    if (!hasPrerequisites) continue;

    const isExclusive = focus.exclusiveWith.some((exclusiveId) =>
      completedFocuses.includes(exclusiveId)
    );
    if (isExclusive) continue;

    availableFocuses.push({ id: id, ...focus });
  }

  return { success: true, focuses: availableFocuses, activeFocus: null };
}

function startNationalFocus(userIp, focusId) {
  // Changed userEmail to userIp
  let nations = data.getAllNations();
  if (!userIp)
    return { success: false, message: "IPアドレスが取得できませんでした。" }; // Changed message

  const focus = NATIONAL_FOCUSES[focusId];
  if (!focus) return { success: false, message: "無効な国家方針です。" };

  let userNation = nations.find((n) => n.owner === userIp); // Changed from email to IP
  if (!userNation)
    return { success: false, message: "あなたの国が見つかりません。" };
  if (userNation.activeFocusId)
    return { success: false, message: "すでに国家方針を実行中です。" };
  if ((userNation.completedFocuses || []).includes(focusId))
    return { success: false, message: "この国家方針はすでに完了しています。" };

  const hasPrerequisites = focus.prerequisites.every((prereqId) =>
    (userNation.completedFocuses || []).includes(prereqId)
  );
  if (!hasPrerequisites)
    return { success: false, message: "前提条件が満たされていません。" };
  const isExclusive = focus.exclusiveWith.some((exclusiveId) =>
    (userNation.completedFocuses || []).includes(exclusiveId)
  );
  if (isExclusive)
    return {
      success: false,
      message: "排他的な国家方針がすでに完了しています。",
    };

  userNation.activeFocusId = focusId;
  userNation.focusTurnsRemaining = focus.costTurns;

  data.setAllNations(nations);
  addNews(`${userNation.name} が国家方針「${focus.name}」を開始しました。`);
  return {
    success: true,
    message: `国家方針「${focus.name}」を開始しました。`,
  };
}

function processNationalFocusProgress() {
  let nations = data.getAllNations();

  nations.forEach((nation) => {
    if (nation.activeFocusId && nation.focusTurnsRemaining > 0) {
      nation.focusTurnsRemaining--;

      if (nation.focusTurnsRemaining === 0) {
        const completedFocus = NATIONAL_FOCUSES[nation.activeFocusId];
        if (completedFocus) {
          addNews(
            `${nation.name} が国家方針「${completedFocus.name}」を完了しました！`
          );
          if (!nation.completedFocuses) nation.completedFocuses = [];
          nation.completedFocuses.push(nation.activeFocusId);

          // Apply one-time effects if any
          if (completedFocus.effects.moneyGain) {
            nation.money += completedFocus.effects.moneyGain;
          }
        }
        nation.activeFocusId = "";
        nation.focusTurnsRemaining = 0;
      }
    }
  });
  data.setAllNations(nations);
}

function resetNationalFocus(userIp) {
  // Changed userEmail to userIp
  let nations = data.getAllNations();
  if (!userIp)
    return { success: false, message: "IPアドレスが取得できませんでした。" }; // Changed message

  let userNation = nations.find((n) => n.owner === userIp); // Changed from email to IP
  if (!userNation)
    return { success: false, message: "あなたの国が見つかりません。" };

  userNation.activeFocusId = "";
  userNation.focusTurnsRemaining = 0;
  userNation.completedFocuses = [];

  data.setAllNations(nations);
  addNews(`${userNation.name} の国家方針がリセットされました。(テスト用)`);
  return { success: true, message: "国家方針がリセットされました。" };
}

module.exports = {
  getNations,
  getArmyDeployment,
  getLatestNews,
  registerNation,
  buyTerritory,
  reinforceArmy,
  deployArmy,
  autoDeployArmy,
  requestAlliance,
  respondToAllianceRequest,
  dissolveAlliance,
  getAlliances,
  attackTerritory,
  bombardTerritory,
  transferResourcesByName,
  spyNation,
  transferTerritory,
  launchMissile,
  getChatMessages,
  postChatMessage,
  addIncomePerMinute,
  addResourcesPerMinute,
  updateUserActivity,
  getOnlineUserNames,
  getAvailableNationalFocuses,
  startNationalFocus,
  processNationalFocusProgress,
  resetNationalFocus,
  removeNationsWithoutTerritories, // Exported for scheduler
  addNews, // Exported for scheduler if needed
};
