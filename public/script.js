// public/script.js

let missileMode = false;
let isRegisteringNation = false;
let attackMode = false;
let deployMode = false;
let bombardMode = false;
let transferMode = false;
const PURCHASE_PRICE = 1500;

const map = L.map("map").setView([20, 0], 2);

L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
  maxZoom: 18,
  subdomains: ["a", "b", "c", "d"],
  attribution:
    '&copy; <a href="https://carto.com/attributions">CARTO</a> ' +
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

let nations = [];
let geojsonLayer;
let armyDeployment = [];

async function fetchData(url, method = "GET", body = null) {
  const options = {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fetch error:", error);
    alert("サーバーとの通信に失敗しました。");
    return { success: false, message: "サーバーエラー" };
  }
}

function loadNations() {
  fetchData("/api/nations").then((result) => {
    if (result.success) {
      nations = result.nations;
      fetchData("/api/army-deployment").then((armyResult) => {
        if (armyResult.success) {
          armyDeployment = armyResult.armyDeployment;
          loadGeoJSON();
          loadAlliances();
          updateUserActivity();
          loadNationalFocusStatus();
        } else {
          alert(armyResult.message);
        }
      });
    } else {
      alert(result.message);
    }
  });
}

let tutorialStep = 0;
let tutorialActive = false;

const tutorialMessages = [
  "🎌 ようこそ、国運営ゲームへ！\nこれから国を作っていく方法を説明します！",
  "まずは「登録する国名」の部分で国名を入力して「国を登録」ボタンを押してください。",
  "次にサイト一番下の地図上の灰色の地域をクリックして、領土を1つ獲得しましょう！",
  "登録できたら、軍隊を増強してみましょう。軍隊増強で歩兵を1人追加してみてね。歩兵以外にもいろいろな種類の兵器があるよ",
  "軍を配置してみてください。軍配置モードの均等に配置で今回はおｋです、配置しないと攻められたらすぐに奪われてしまいます。また軍隊を増やしたらすぐ配置してください",
  "攻撃モードでは、敵の領土を選んで攻撃できますが、今回は説明だけにしておきます。",
  "チュートリアル完了！これから自分の戦略で国を発展させていきましょう🌍",
];

function startTutorial() {
  tutorialStep = 0;
  tutorialActive = true;
  showTutorialBox();
  nextTutorialStep();
}

function nextTutorialStep() {
  if (tutorialStep >= tutorialMessages.length) {
    endTutorial();
    return;
  }

  document.getElementById("tutorialText").textContent =
    tutorialMessages[tutorialStep];

  if (tutorialStep === 1) {
    alert("国名を入力して『国を登録』を押してね！");
  }
  if (tutorialStep === 2) {
    isRegisteringNation = true;
    alert("地図上の灰色地域をクリックして領土を選びましょう！");
  }
  if (tutorialStep === 3) {
    alert("『歩兵』を1人増強してみてください！");
  }
  if (tutorialStep === 4) {
    alert(
      "軍を配置してみてください。軍配置モードの均等に配置で今回はおｋです、配置しないと攻められたらすぐに奪われてしまいます"
    );
  }
  if (tutorialStep === 5) {
    alert(
      "攻撃モードの説明：攻撃は他国の領土を奪うための手段です。今回はチュートリアルなので操作しません。"
    );
  }

  tutorialStep++;
}

function endTutorial() {
  tutorialActive = false;
  hideTutorialBox();
  alert("🎉 チュートリアル完了！がんばって国を発展させてね！");
}

function showTutorialBox() {
  document.getElementById("tutorialBox").style.display = "block";
}

function hideTutorialBox() {
  document.getElementById("tutorialBox").style.display = "none";
}

function startMissileMode() {
  const missileCount = parseInt(
    document.getElementById("missileCountInput").value,
    10
  );
  if (isNaN(missileCount) || missileCount < 1 || missileCount > 100) {
    alert("発射するミサイルの数は1から100の間で指定してください。");
    return;
  }
  missileMode = true;
  attackMode = false;
  deployMode = false;
  bombardMode = false;
  transferMode = false;
  updateModeStatus();
}

function endMissileMode() {
  missileMode = false;
  updateModeStatus();
}

function updateModeStatus() {
  const statusDiv = document.getElementById("modeStatus");
  if (deployMode) {
    statusDiv.textContent =
      "配置モード中！自国の領土をクリックして軍を配置できます。";
    statusDiv.style.display = "block";
  } else if (attackMode) {
    statusDiv.textContent = "攻撃モード中！敵国の領土をクリックしてください。";
    statusDiv.style.display = "block";
  } else if (bombardMode) {
    statusDiv.textContent =
      "爆撃モード中！爆撃したい敵領土をクリックしてください。";
    statusDiv.style.display = "block";
  } else if (missileMode) {
    statusDiv.textContent =
      "ミサイルモード中！ミサイルを発射したい敵領土をクリックしてください。";
    statusDiv.style.display = "block";
  } else if (transferMode) {
    statusDiv.textContent =
      "領土譲渡モード中！譲渡したい領土をクリックしてください。";
    statusDiv.style.display = "block";
  } else {
    statusDiv.style.display = "none";
  }
}

function startDeployMode() {
  deployMode = true;
  attackMode = false;
  bombardMode = false;
  missileMode = false;
  transferMode = false;
  updateModeStatus();
}

function endDeployMode() {
  deployMode = false;
  updateModeStatus();
}

function startAttackMode() {
  attackMode = true;
  deployMode = false;
  bombardMode = false;
  missileMode = false;
  transferMode = false;
  updateModeStatus();
}

function startBombardMode() {
  bombardMode = true;
  attackMode = false;
  deployMode = false;
  missileMode = false;
  transferMode = false;
  updateModeStatus();
}

function endBombardMode() {
  bombardMode = false;
  updateModeStatus();
}

async function autoDeploy() {
  const result = await fetchData("/api/auto-deploy-army", "POST", {});
  alert(result.message);
  if (result.success) {
    loadNations();
  }
}

function getNationMap() {
  const map = {};
  nations.forEach((n) => {
    n.territories.forEach((name) => {
      map[name] = n;
    });
  });
  return map;
}

function startTransferMode() {
  transferMode = true;
  attackMode = false;
  deployMode = false;
  bombardMode = false;
  missileMode = false;
  updateModeStatus();
}

function endTransferMode() {
  transferMode = false;
  updateModeStatus();
}

function loadGeoJSON() {
  fetch(
    "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json"
  )
    .then((res) => res.json())
    .then((geojson) => {
      if (geojsonLayer) map.removeLayer(geojsonLayer);

      const nationMap = getNationMap();

      geojsonLayer = L.geoJSON(geojson, {
        style: (feature) => {
          const props = feature.properties;
          const name = props.name;
          const nation = nationMap[name];
          return {
            fillColor: nation ? nation.color : "#ccc",
            weight: 1,
            color: "#333",
            fillOpacity: 0.6,
            dashArray: nation ? null : "3",
          };
        },
        onEachFeature: (feature, layer) => {
          const props = feature.properties;
          const name = props.name;
          const nation = nations.find((n) => n.territories.includes(name));
          layer.bindTooltip(props.name);

          layer.on("click", async () => {
            const clickedCountryName = props.name;
            const nation = nations.find((n) =>
              n.territories.includes(clickedCountryName)
            );

            // 1. 国登録モードの場合
            if (isRegisteringNation) {
              const nationName = document
                .getElementById("nationNameInput")
                .value.trim();
              if (!nationName) {
                alert("国名が入力されていません。");
                return;
              }
              const result = await fetchData("/api/register-nation", "POST", {
                nationName,
                countryName: clickedCountryName,
              });
              if (result.success) {
                alert("国を登録しました！");
                isRegisteringNation = false;
                loadNations();
              } else {
                alert(result.message);
              }
              return;
            }

            // 2. 軍配置モードの場合 (自分の領土のみ)
            if (
              deployMode &&
              nation &&
              nations.find(
                (n) =>
                  n.owner === nation.owner &&
                  n.territories.includes(clickedCountryName)
              )
            ) {
              const inf = parseInt(
                document.getElementById("deployInfantry").value,
                10
              );
              const tank = parseInt(
                document.getElementById("deployTank").value,
                10
              );
              const mechInf = parseInt(
                document.getElementById("deployMechInf").value,
                10
              );
              if (
                isNaN(inf) ||
                isNaN(tank) ||
                isNaN(mechInf) ||
                inf < 0 ||
                tank < 0 ||
                mechInf < 0
              ) {
                alert("兵力数が正しくありません");
                return;
              }
              const result = await fetchData("/api/deploy-army", "POST", {
                countryName: clickedCountryName,
                infantry: inf,
                tank: tank,
                mechanizedInfantry: mechInf,
              });
              alert(result.message);
              loadNations();
              return;
            }

            // 3. 攻撃モードの場合 (他国の領土のみ)
            if (
              attackMode &&
              nation &&
              nations.find(
                (n) =>
                  n.owner === nation.owner &&
                  !n.territories.includes(clickedCountryName)
              )
            ) {
              const infantry = parseInt(
                document.getElementById("attackInfantry").value,
                10
              );
              const tank = parseInt(
                document.getElementById("attackTank").value,
                10
              );
              const mechInf = parseInt(
                document.getElementById("attackMechInf").value,
                10
              );
              if (
                isNaN(infantry) ||
                isNaN(tank) ||
                isNaN(mechInf) ||
                infantry < 0 ||
                tank < 0 ||
                mechInf < 0
              ) {
                alert("攻撃兵力を正しく入力してください");
                return;
              }
              const result = await fetchData("/api/attack-territory", "POST", {
                targetCountryName: clickedCountryName,
                attackInfantry: infantry,
                attackTank: tank,
                attackMechanizedInfantry: mechInf,
              });
              alert(result.message);
              attackMode = false;
              updateModeStatus();
              loadNations();
              return;
            } else if (
              attackMode &&
              nation &&
              nations.find(
                (n) =>
                  n.owner === nation.owner &&
                  n.territories.includes(clickedCountryName)
              )
            ) {
              alert("自分の領土を攻撃することはできません。");
              return;
            }

            // 4. 爆撃モードの場合 (他国の領土のみ)
            if (
              bombardMode &&
              nation &&
              nations.find(
                (n) =>
                  n.owner === nation.owner &&
                  !n.territories.includes(clickedCountryName)
              )
            ) {
              if (
                !confirm(`${props.name}を爆撃しますか？（爆撃機を1機消費）`)
              ) {
                return;
              }
              const result = await fetchData("/api/bombard-territory", "POST", {
                targetCountryName: clickedCountryName,
              });
              alert(result.message);
              bombardMode = false;
              updateModeStatus();
              loadNations();
              return;
            } else if (
              bombardMode &&
              nation &&
              nations.find(
                (n) =>
                  n.owner === nation.owner &&
                  n.territories.includes(clickedCountryName)
              )
            ) {
              alert("自分の領土を爆撃することはできません。");
              return;
            }

            // 5. ミサイルモードの場合 (他国の領土のみ)
            if (
              missileMode &&
              nation &&
              nations.find(
                (n) =>
                  n.owner === nation.owner &&
                  !n.territories.includes(clickedCountryName)
              )
            ) {
              const missileCount = parseInt(
                document.getElementById("missileCountInput").value,
                10
              );
              if (
                isNaN(missileCount) ||
                missileCount < 1 ||
                missileCount > 100
              ) {
                alert("発射するミサイルの数は1から100の間で指定してください。");
                return;
              }
              if (
                !confirm(
                  `${props.name}にミサイルを${missileCount}発発射しますか？（10秒後に着弾）`
                )
              ) {
                return;
              }
              alert(
                `ミサイルが${props.name}に向けて${missileCount}発発射されました！10秒後に着弾します。`
              );
              setTimeout(async () => {
                const result = await fetchData("/api/launch-missile", "POST", {
                  targetCountryName: clickedCountryName,
                  missileCount: missileCount,
                }); // missileCountを送信
                alert(result.message);
                loadNations();
              }, 10000);
              missileMode = false;
              updateModeStatus();
              return;
            } else if (
              missileMode &&
              nation &&
              nations.find(
                (n) =>
                  n.owner === nation.owner &&
                  n.territories.includes(clickedCountryName)
              )
            ) {
              alert("自分の領土にミサイルを発射することはできません。");
              return;
            }

            // 6. 領土譲渡モード (自分の領土のみ)
            if (
              transferMode &&
              nation &&
              nations.find(
                (n) =>
                  n.owner === nation.owner &&
                  n.territories.includes(clickedCountryName)
              )
            ) {
              const targetNationName = document
                .getElementById("transferNationName")
                .value.trim();
              if (!targetNationName) {
                alert("譲渡先の国名を入力してください。");
                return;
              }
              const result = await fetchData(
                "/api/transfer-territory",
                "POST",
                { targetNationName, territoryName: clickedCountryName }
              );
              alert(result.message);
              transferMode = false;
              updateModeStatus();
              loadNations();
              return;
            } else if (
              transferMode &&
              nation &&
              nations.find(
                (n) =>
                  n.owner === nation.owner &&
                  !n.territories.includes(clickedCountryName)
              )
            ) {
              alert("他国の領土を譲渡することはできません。");
              return;
            }

            // 7. 通常クリック時の情報表示または領土購入
            if (nation) {
              const myNation = nations.find((n) => n.owner === nation.owner);
              const isOwner = myNation && myNation.owner === nation.owner;
              const deployment = armyDeployment.find(
                (a) =>
                  a.countryCode === clickedCountryName &&
                  a.owner === nation.owner
              );
              const deployedInf = deployment ? deployment.infantry : 0;
              const deployedTank = deployment ? deployment.tank : 0;
              const deployedMechInf = deployment
                ? deployment.mechanizedInfantry
                : 0;

              let info =
                `<b>${nation.name}</b><br>所持者IP: ${nation.owner}<br>人口: ${nation.population}<br>` +
                `石油: ${nation.oil}<br>` +
                `鉄: ${nation.iron}<br>`;

              if (isOwner) {
                info +=
                  `総兵力 - 歩兵: ${nation.infantry}, 戦車: ${nation.tank}, 機械化歩兵: ${nation.mechanizedInfantry}, 爆撃機: ${nation.bomber}, ミサイル: ${nation.missile}<br>` +
                  `配置兵力 - 歩兵: ${deployedInf}, 戦車: ${deployedTank}, 機械化歩兵: ${deployedMechInf}<br>` +
                  `お金: ${nation.money}<br>`;
              }

              layer.bindPopup(info).openPopup();
            } else {
              // 未所属地の購入
              if (
                !confirm(
                  `${props.name} は未所属地です。${PURCHASE_PRICE} お金で購入しますか？`
                )
              ) {
                return;
              }
              const result = await fetchData("/api/buy-territory", "POST", {
                countryName: clickedCountryName,
              });
              if (result.success) {
                alert(`購入成功！残りのお金：${result.newMoney}`);
                loadNations();
              } else {
                alert(result.message);
              }
            }
          });
        },
      }).addTo(map);
    });
}

function startRegisterNation() {
  const nationName = document.getElementById("nationNameInput").value.trim();
  if (!nationName) {
    alert("国名を入力してください");
    return;
  }
  isRegisteringNation = true;
  attackMode = false;
  deployMode = false;
  bombardMode = false;
  missileMode = false;
  transferMode = false;
  updateModeStatus();
  alert("登録したい国を地図上でクリックしてください");
}

async function reinforce() {
  const type = document.getElementById("unitType").value;
  const amount = parseInt(document.getElementById("unitAmount").value, 10);

  if (isNaN(amount) || amount <= 0) {
    alert("正しい数量を入力してください");
    return;
  }

  const result = await fetchData("/api/reinforce-army", "POST", {
    type,
    amount,
  });
  if (result.success) {
    alert(result.message);
    loadNations();
  } else {
    alert(result.message);
  }
}

async function sendResourcesByName() {
  const name = document.getElementById("targetNationName").value.trim();
  const type = document.getElementById("resourceType").value;
  const amount = document.getElementById("resourceAmount").value;

  if (!name) {
    alert("相手の国名を入力してください");
    return;
  }

  const result = await fetchData("/api/transfer-resources", "POST", {
    toNationName: name,
    type,
    amount,
  });
  alert(result.message);
  if (result.success) {
    loadNations();
  }
}

async function spy() {
  const target = document.getElementById("spyTargetNation").value.trim();
  if (!target) {
    alert("スパイ対象の国名を入力してください。");
    return;
  }
  const result = await fetchData("/api/spy-nation", "POST", {
    targetNationName: target,
  });
  const resultDiv = document.getElementById("spyResult");
  if (result.success) {
    let info = result.info;
    resultDiv.innerHTML = `
      <p>スパイ成功！ ${result.message}</p>
      <p>歩兵: ${info.infantry}体</p>
      <p>戦車: ${info.tank}台</p>
      <p>機械化歩兵: ${info.mechanizedInfantry}体</p>
      <p>爆撃機: ${info.bomber}機</p>
      <p>ミサイル: ${info.missile}機</p>
      <p>お金: ${info.money}円</p>
      <p>石油: ${info.oil}個</p>
      <p>鉄: ${info.iron}個</p>
    `;
  } else {
    alert(result.message);
    resultDiv.innerHTML = "";
  }
}

async function updateUserActivity() {
  await fetchData("/api/update-user-activity", "POST", {});
}

async function loadNews() {
  const result = await fetchData("/api/news");
  if (result.success) {
    const list = document.getElementById("newsList");
    list.innerHTML = "";
    result.news.forEach((line) => {
      const li = document.createElement("li");
      li.textContent = line;
      list.insertBefore(li, list.firstChild);
    });
  }
}

async function sendChatMessage() {
  const input = document.getElementById("chatInput");
  const message = input.value.trim();
  if (message) {
    const result = await fetchData("/api/post-chat-message", "POST", {
      message,
    });
    if (result.success) {
      input.value = "";
      loadChatMessages();
    } else {
      alert(result.message);
    }
  }
}

async function loadChatMessages() {
  const result = await fetchData("/api/chat-messages");
  if (result.success) {
    const chatLog = document.getElementById("chatLog");
    const shouldScroll =
      chatLog.scrollTop + chatLog.clientHeight >= chatLog.scrollHeight - 5;

    chatLog.innerHTML = "";
    result.messages.forEach((msg) => {
      const p = document.createElement("p");
      p.innerHTML = `<span class="chat-time">[${msg.time}]</span> <span class="chat-name">${msg.nationName}:</span> ${msg.message}`;
      chatLog.appendChild(p);
    });

    if (shouldScroll) {
      chatLog.scrollTop = chatLog.scrollHeight;
    }
  }
}

const bgm = new Audio(
  "https://www.mod.go.jp/gsdf/fan/sound/download/bunretsu_koshin.mp3"
);
bgm.loop = true;

document.body.addEventListener(
  "click",
  function () {
    bgm.play().catch((e) => console.log("Audio play prevented:", e));
  },
  { once: true }
);

setInterval(loadNews, 7000);
setInterval(loadChatMessages, 5000);

// --- Alliance JavaScript Functions ---
async function requestAlliance() {
  const targetNationName = document
    .getElementById("allianceTargetNationName")
    .value.trim();
  if (!targetNationName) {
    alert("同盟申請先の国名を入力してください。");
    return;
  }
  const result = await fetchData("/api/request-alliance", "POST", {
    targetNationName,
  });
  alert(result.message);
  if (result.success) {
    loadAlliances();
  }
}

async function respondToAllianceRequest(requesterIp, response) {
  const result = await fetchData("/api/respond-to-alliance", "POST", {
    requesterIp,
    response,
  });
  alert(result.message);
  if (result.success) {
    loadAlliances();
  }
}

async function loadAlliances() {
  const data = await fetchData("/api/alliances");

  const pendingList = document.getElementById("pendingAllianceRequests");
  pendingList.innerHTML = "";
  if (data.pendingRequests.length === 0) {
    pendingList.innerHTML = "<li>現在、あなたへの同盟申請はありません。</li>";
  } else {
    data.pendingRequests.forEach((req) => {
      const li = document.createElement("li");
      li.innerHTML = `${req.requesterNationName} からの申請 <button onclick="respondToAllianceRequest('${req.requesterIp}', 'approve')">承認</button> <button onclick="respondToAllianceRequest('${req.requesterIp}', 'reject')">拒否</button>`;
      pendingList.appendChild(li);
    });
  }

  const currentList = document.getElementById("currentAlliances");
  currentList.innerHTML = "";
  if (data.approvedAlliances.length === 0) {
    currentList.innerHTML = "<li>現在、同盟国はいません。</li>";
  } else {
    data.approvedAlliances.forEach((alliance) => {
      const li = document.createElement("li");
      li.innerHTML = `${alliance.nationName} <button onclick="dissolveAlliance('${alliance.ip}')">解除</button>`;
      currentList.appendChild(li);
    });
  }
}

async function dissolveAlliance(alliedNationIp) {
  if (confirm("本当にこの同盟を解除しますか？")) {
    const result = await fetchData("/api/dissolve-alliance", "POST", {
      alliedNationIp,
    });
    alert(result.message);
    if (result.success) {
      loadAlliances();
    }
  }
}

async function loadOnlineUsers() {
  const result = await fetchData("/api/online-users");
  if (result.success) {
    const list = document.getElementById("onlineUsersList");
    list.innerHTML = "";

    if (result.onlineUsers.length === 0) {
      list.innerHTML = "<li>現在、オンラインのプレイヤーはいません。</li>";
    } else {
      result.onlineUsers.forEach((name) => {
        const li = document.createElement("li");
        li.textContent = name;
        list.appendChild(li);
      });
    }
  }
}

// --- NEW: National Focus JavaScript Functions ---
async function loadNationalFocusStatus() {
  const result = await fetchData("/api/available-focuses");

  const currentStatusDiv = document.getElementById("currentFocusStatus");
  const focusNameSpan = document.getElementById("focusName");
  const focusDescriptionSpan = document.getElementById("focusDescription");
  const focusProgressP = document.getElementById("focusProgress");
  const focusTurnsRemainingSpan = document.getElementById(
    "focusTurnsRemaining"
  );
  const availableFocusesList = document.getElementById("availableFocuses");
  const resetFocusBtn = document.getElementById("resetFocusBtn");

  if (!result.success) {
    currentStatusDiv.className = "no-focus";
    focusNameSpan.textContent = "エラー";
    focusDescriptionSpan.textContent = result.message;
    focusProgressP.style.display = "none";
    availableFocusesList.innerHTML = `<li>${result.message}</li>`;
    resetFocusBtn.style.display = "none";
    return;
  }

  if (result.activeFocus) {
    currentStatusDiv.className = "";
    focusNameSpan.textContent = result.activeFocus.name;
    focusDescriptionSpan.textContent = result.activeFocus.description;
    focusProgressP.style.display = "block";
    focusTurnsRemainingSpan.textContent = result.focusTurnsRemaining;
    resetFocusBtn.style.display = "inline-block";
  } else {
    currentStatusDiv.className = "no-focus";
    focusNameSpan.textContent = "なし";
    focusDescriptionSpan.textContent =
      "国家方針を選択して、国を強化しましょう。";
    focusProgressP.style.display = "none";
    resetFocusBtn.style.display = "none";
  }

  availableFocusesList.innerHTML = "";
  if (result.focuses && result.focuses.length > 0) {
    result.focuses.forEach((focus) => {
      const li = document.createElement("li");
      li.className = "focus-item";
      let effectsText = "";
      for (const effectKey in focus.effects) {
        const value = focus.effects[effectKey];
        if (effectKey === "ironProductionBonus")
          effectsText += `鉄生産+${value * 100}%, `;
        else if (effectKey === "oilProductionBonus")
          effectsText += `石油生産+${value * 100}%, `;
        else if (effectKey === "moneyProductionBonus")
          effectsText += `お金生産+${value * 100}%, `;
        else if (effectKey === "infantryPowerBonus")
          effectsText += `歩兵戦闘力+${value}, `;
        else if (effectKey === "tankPowerBonus")
          effectsText += `戦車戦闘力+${value}, `;
        else if (effectKey === "mechanizedInfantryPowerBonus")
          effectsText += `機械化歩兵戦闘力+${value}, `;
        else if (effectKey === "populationGrowthBonus")
          effectsText += `人口増加率+${value * 100}%, `;
        else if (effectKey === "missileCostReduction")
          effectsText += `ミサイルコスト-${value * 100}%, `;
        else if (effectKey === "bomberCostReduction")
          effectsText += `爆撃機コスト-${value * 100}%, `;
        else if (effectKey === "defenseBonusIncrease")
          effectsText += `防衛ボーナス+${value}, `;
      }
      effectsText = effectsText.slice(0, -2);

      li.innerHTML = `
        <h4>${focus.name}</h4>
        <p>${focus.description}</p>
        <p class="cost">所要ターン: ${focus.costTurns}ターン</p>
        <p><strong>効果:</strong> ${effectsText}</p>
        <button onclick="startFocus('${focus.id}')">開始</button>
      `;
      availableFocusesList.appendChild(li);
    });
  } else if (!result.activeFocus) {
    availableFocusesList.innerHTML =
      "<li>現在、利用可能な国家方針はありません。</li>";
  }
}

async function startFocus(focusId) {
  if (confirm("国家方針「" + focusId + "」を開始しますか？")) {
    const result = await fetchData("/api/start-focus", "POST", { focusId });
    alert(result.message);
    if (result.success) {
      loadNationalFocusStatus();
      loadNations();
    }
  }
}

async function resetFocus() {
  if (confirm("国家方針をリセットしますか？ (完了した方針もクリアされます)")) {
    const result = await fetchData("/api/reset-focus", "POST", {});
    alert(result.message);
    if (result.success) {
      loadNationalFocusStatus();
      loadNations();
    }
  }
}

// Initial loads and periodic updates
window.onload = () => {
  loadNations();
  loadChatMessages();
  loadAlliances();
  loadOnlineUsers();
  loadNationalFocusStatus();

  setInterval(loadNations, 7000);
  setInterval(loadChatMessages, 5000);
  setInterval(loadAlliances, 10000);
  setInterval(loadOnlineUsers, 15000);
  setInterval(loadNationalFocusStatus, 7000);
  setInterval(updateUserActivity, 20000);
};
