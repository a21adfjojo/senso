// constants.js

// Game balance constants
const PURCHASE_PRICE = 1500; // Cost to buy a new territory

// Unit costs and stats
const INFANTRY_COST = 30;
const INFANTRY_OIL_COST = 1;
const INFANTRY_IRON_COST = 2;
const INFANTRY_POWER = 1; // Base combat power

const TANK_COST = 70;
const TANK_OIL_COST = 3;
const TANK_IRON_COST = 5;
const TANK_POWER = 3; // Base combat power

const MECHANIZED_INFANTRY_COST = 50;
const MECHANIZED_INFANTRY_OIL_COST = 2;
const MECHANIZED_INFANTRY_IRON_COST = 3;
const MECHANIZED_INFANTRY_POWER = 2; // Base combat power

const BOMBER_COST = 90;
const BOMBER_OIL_COST = 5;
const BOMBER_IRON_COST = 7;
// Bomber destruction rates (percentage of target's deployed units)
const BOMBER_INFANTRY_DESTRUCTION_RATE = 0.3; // 30%
const BOMBER_TANK_DESTRUCTION_RATE = 0.15; // 15%
const BOMBER_MECH_DESTRUCTION_RATE = 0.2; // 20%

const MISSILE_COST = 10000;
const MISSILE_OIL_COST = 50;
const MISSILE_IRON_COST = 100;

// Territory-specific resource production (increased values)
// 各領土の石油と鉄の生産量を約2倍に増加させました。
const TERRITORY_RESOURCES = {
  Afghanistan: { oil: 0, iron: 2 },
  Albania: { oil: 0, iron: 1 },
  Algeria: { oil: 10, iron: 5 },
  Andorra: { oil: 0, iron: 0 },
  Angola: { oil: 12, iron: 3 },
  Antarctica: { oil: 0, iron: 0 },
  Argentina: { oil: 6, iron: 8 },
  Armenia: { oil: 0, iron: 2 },
  Australia: { oil: 15, iron: 20 },
  Austria: { oil: 2, iron: 4 },
  Azerbaijan: { oil: 8, iron: 3 },
  Bahamas: { oil: 0, iron: 0 },
  Bangladesh: { oil: 0, iron: 2 },
  Belarus: { oil: 0, iron: 4 },
  Belgium: { oil: 0, iron: 3 },
  Belize: { oil: 0, iron: 0 },
  Benin: { oil: 0, iron: 0 },
  Bhutan: { oil: 0, iron: 1 },
  Bolivia: { oil: 4, iron: 6 },
  "Bosnia and Herzegovina": { oil: 0, iron: 2 },
  Botswana: { oil: 0, iron: 4 },
  Brazil: { oil: 18, iron: 25 },
  Brunei: { oil: 4, iron: 0 },
  Bulgaria: { oil: 0, iron: 3 },
  "Burkina Faso": { oil: 0, iron: 1 },
  Burundi: { oil: 0, iron: 0 },
  Cambodia: { oil: 0, iron: 2 },
  Cameroon: { oil: 4, iron: 2 },
  Canada: { oil: 25, iron: 30 },
  "Central African Republic": { oil: 0, iron: 1 },
  Chad: { oil: 6, iron: 1 },
  Chile: { oil: 2, iron: 8 },
  China: { oil: 30, iron: 40 },
  Colombia: { oil: 10, iron: 5 },
  Comoros: { oil: 0, iron: 0 },
  "Congo (Brazzaville)": { oil: 6, iron: 1 },
  "Congo (Kinshasa)": { oil: 8, iron: 5 },
  "Costa Rica": { oil: 0, iron: 0 },
  Croatia: { oil: 0, iron: 2 },
  Cuba: { oil: 2, iron: 1 },
  Cyprus: { oil: 0, iron: 0 },
  "Czech Republic": { oil: 0, iron: 4 },
  Denmark: { oil: 4, iron: 1 },
  Djibouti: { oil: 0, iron: 0 },
  "Dominican Republic": { oil: 0, iron: 0 },
  "East Timor": { oil: 2, iron: 0 },
  Ecuador: { oil: 6, iron: 2 },
  Egypt: { oil: 8, iron: 5 },
  "El Salvador": { oil: 0, iron: 0 },
  "Equatorial Guinea": { oil: 4, iron: 0 },
  Eritrea: { oil: 0, iron: 1 },
  Estonia: { oil: 0, iron: 1 },
  Ethiopia: { oil: 0, iron: 2 },
  "Falkland Islands": { oil: 0, iron: 0 },
  Fiji: { oil: 0, iron: 0 },
  Finland: { oil: 0, iron: 5 },
  France: { oil: 4, iron: 10 },
  Gabon: { oil: 6, iron: 1 },
  Gambia: { oil: 0, iron: 0 },
  Georgia: { oil: 0, iron: 2 },
  Germany: { oil: 6, iron: 15 },
  Ghana: { oil: 4, iron: 2 },
  Greece: { oil: 2, iron: 3 },
  Greenland: { oil: 0, iron: 0 },
  Guatemala: { oil: 0, iron: 1 },
  Guinea: { oil: 0, iron: 3 },
  "Guinea Bissau": { oil: 0, iron: 0 },
  Guyana: { oil: 2, iron: 1 },
  Haiti: { oil: 0, iron: 0 },
  Honduras: { oil: 0, iron: 1 },
  Hungary: { oil: 0, iron: 3 },
  Iceland: { oil: 0, iron: 0 },
  India: { oil: 20, iron: 25 },
  Indonesia: { oil: 15, iron: 10 },
  Iran: { oil: 25, iron: 10 },
  Iraq: { oil: 20, iron: 5 },
  Ireland: { oil: 0, iron: 1 },
  Israel: { oil: 0, iron: 0 },
  Italy: { oil: 2, iron: 8 },
  "Ivory Coast": { oil: 4, iron: 2 },
  Jamaica: { oil: 0, iron: 0 },
  Japan: { oil: 5, iron: 15 },
  Jordan: { oil: 0, iron: 1 },
  Kazakhstan: { oil: 15, iron: 10 },
  Kenya: { oil: 0, iron: 2 },
  "North Korea": { oil: 0, iron: 5 },
  "South Korea": { oil: 0, iron: 8 },
  Kosovo: { oil: 0, iron: 0 },
  Kuwait: { oil: 10, iron: 0 },
  Kyrgyzstan: { oil: 0, iron: 2 },
  Laos: { oil: 0, iron: 1 },
  Latvia: { oil: 0, iron: 1 },
  Lebanon: { oil: 0, iron: 0 },
  Lesotho: { oil: 0, iron: 0 },
  Liberia: { oil: 0, iron: 1 },
  Libya: { oil: 15, iron: 3 },
  Liechtenstein: { oil: 0, iron: 0 },
  Lithuania: { oil: 0, iron: 2 },
  Luxembourg: { oil: 0, iron: 1 },
  Macedonia: { oil: 0, iron: 1 },
  Madagascar: { oil: 0, iron: 2 },
  Malawi: { oil: 0, iron: 0 },
  Malaysia: { oil: 8, iron: 5 },
  Maldives: { oil: 0, iron: 0 },
  Mali: { oil: 0, iron: 2 },
  Malta: { oil: 0, iron: 0 },
  Mauritania: { oil: 0, iron: 2 },
  Mexico: { oil: 10, iron: 12 },
  Moldova: { oil: 0, iron: 1 },
  Monaco: { oil: 0, iron: 0 },
  Mongolia: { oil: 0, iron: 5 },
  Montenegro: { oil: 0, iron: 0 },
  Morocco: { oil: 0, iron: 3 },
  Mozambique: { oil: 2, iron: 3 },
  Myanmar: { oil: 4, iron: 3 },
  Namibia: { oil: 0, iron: 3 },
  Nepal: { oil: 0, iron: 1 },
  Netherlands: { oil: 4, iron: 2 },
  "New Zealand": { oil: 2, iron: 3 },
  Nicaragua: { oil: 0, iron: 1 },
  Niger: { oil: 0, iron: 2 },
  Nigeria: { oil: 18, iron: 5 },
  Norway: { oil: 10, iron: 2 },
  Oman: { oil: 8, iron: 1 },
  Pakistan: { oil: 6, iron: 8 },
  Panama: { oil: 0, iron: 0 },
  "Papua New Guinea": { oil: 4, iron: 2 },
  Paraguay: { oil: 0, iron: 2 },
  Peru: { oil: 6, iron: 6 },
  Philippines: { oil: 2, iron: 4 },
  Poland: { oil: 2, iron: 8 },
  Portugal: { oil: 0, iron: 2 },
  Qatar: { oil: 6, iron: 0 },
  Romania: { oil: 4, iron: 5 },
  Russia: { oil: 40, iron: 50 }, // Significantly increased
  Rwanda: { oil: 0, iron: 0 },
  "San Marino": { oil: 0, iron: 0 },
  "Sao Tome and Principe": { oil: 0, iron: 0 },
  "Saudi Arabia": { oil: 35, iron: 5 },
  Senegal: { oil: 0, iron: 1 },
  Serbia: { oil: 0, iron: 2 },
  "Sierra Leone": { oil: 0, iron: 1 },
  Singapore: { oil: 0, iron: 0 },
  Slovakia: { oil: 0, iron: 3 },
  Slovenia: { oil: 0, iron: 1 },
  "Solomon Islands": { oil: 0, iron: 0 },
  Somalia: { oil: 0, iron: 1 },
  "South Africa": { oil: 8, iron: 15 },
  "South Sudan": { oil: 4, iron: 1 },
  Spain: { oil: 2, iron: 7 },
  "Sri Lanka": { oil: 0, iron: 1 },
  Sudan: { oil: 6, iron: 2 },
  Suriname: { oil: 2, iron: 0 },
  Swaziland: { oil: 0, iron: 0 },
  Sweden: { oil: 0, iron: 8 },
  Switzerland: { oil: 0, iron: 2 },
  Syria: { oil: 4, iron: 2 },
  Taiwan: { oil: 0, iron: 3 },
  Tajikistan: { oil: 0, iron: 2 },
  Tanzania: { oil: 0, iron: 3 },
  Thailand: { oil: 2, iron: 5 },
  Togo: { oil: 0, iron: 0 },
  "Trinidad and Tobago": { oil: 4, iron: 0 },
  Tunisia: { oil: 2, iron: 1 },
  Turkey: { oil: 4, iron: 8 },
  Turkmenistan: { oil: 10, iron: 3 },
  Uganda: { oil: 0, iron: 1 },
  Ukraine: { oil: 4, iron: 10 },
  "United Arab Emirates": { oil: 12, iron: 0 },
  "United Kingdom": { oil: 6, iron: 12 },
  "United States": { oil: 35, iron: 45 }, // Significantly increased
  Uruguay: { oil: 0, iron: 1 },
  Uzbekistan: { oil: 6, iron: 4 },
  Vanuatu: { oil: 0, iron: 0 },
  Venezuela: { oil: 20, iron: 5 },
  Vietnam: { oil: 2, iron: 4 },
  "Western Sahara": { oil: 0, iron: 0 },
  Yemen: { oil: 4, iron: 1 },
  Zambia: { oil: 0, iron: 4 },
  Zimbabwe: { oil: 0, iron: 2 },
};

// National Focuses
const NATIONAL_FOCUSES = {
  industrial_expansion: {
    name: "産業拡大計画",
    description: "国内の産業を拡大し、資源生産量を増加させる。",
    costTurns: 3,
    prerequisites: [],
    exclusiveWith: ["agricultural_revolution"],
    effects: {
      ironProductionBonus: 0.5, // 鉄生産50%増加
      oilProductionBonus: 0.5, // 石油生産50%増加
    },
  },
  agricultural_revolution: {
    name: "農業革命",
    description: "農業技術を革新し、人口増加率と食料生産（収入）を向上させる。",
    costTurns: 2,
    prerequisites: [],
    exclusiveWith: ["industrial_expansion"],
    effects: {
      populationGrowthBonus: 0.001, // 人口増加率+0.1%
      moneyProductionBonus: 0.2, // 収入20%増加
    },
  },
  military_modernization: {
    name: "軍事近代化",
    description: "軍備を近代化し、部隊の戦闘力を向上させる。",
    costTurns: 4,
    prerequisites: ["industrial_expansion"],
    exclusiveWith: [],
    effects: {
      infantryPowerBonus: 0.2, // 歩兵戦闘力+0.2
      tankPowerBonus: 0.5, // 戦車戦闘力+0.5
      mechanizedInfantryPowerBonus: 0.3, // 機械化歩兵戦闘力+0.3
    },
  },
  missile_development: {
    name: "ミサイル開発計画",
    description: "新型ミサイルの開発を進め、ミサイルコストを削減する。",
    costTurns: 5,
    prerequisites: ["military_modernization"],
    exclusiveWith: [],
    effects: {
      missileCostReduction: 0.2, // ミサイルコスト20%削減
    },
  },
  air_superiority: {
    name: "制空権確保",
    description: "空軍力を強化し、爆撃機のコストを削減する。",
    costTurns: 3,
    prerequisites: ["military_modernization"],
    exclusiveWith: [],
    effects: {
      bomberCostReduction: 0.2, // 爆撃機コスト20%削減
    },
  },
  fortification_program: {
    name: "要塞化プログラム",
    description: "国境の防衛を強化し、領土防衛時のボーナスを増加させる。",
    costTurns: 3,
    prerequisites: [],
    exclusiveWith: [],
    effects: {
      defenseBonusIncrease: 0.1, // 防衛ボーナス+0.1
    },
  },
  economic_stimulus: {
    name: "経済刺激策",
    description: "経済を活性化させ、一時的に多額の資金を得る。",
    costTurns: 1,
    prerequisites: [],
    exclusiveWith: [],
    effects: {
      moneyGain: 5000, // 一時的に5000円獲得
    },
  },
};

module.exports = {
  PURCHASE_PRICE,
  INFANTRY_COST,
  INFANTRY_OIL_COST,
  INFANTRY_IRON_COST,
  INFANTRY_POWER,
  TANK_COST,
  TANK_OIL_COST,
  TANK_IRON_COST,
  TANK_POWER,
  MECHANIZED_INFANTRY_COST,
  MECHANIZED_INFANTRY_OIL_COST,
  MECHANIZED_INFANTRY_IRON_COST,
  MECHANIZED_INFANTRY_POWER,
  BOMBER_COST,
  BOMBER_OIL_COST,
  BOMBER_IRON_COST,
  BOMBER_INFANTRY_DESTRUCTION_RATE,
  BOMBER_TANK_DESTRUCTION_RATE,
  BOMBER_MECH_DESTRUCTION_RATE,
  MISSILE_COST,
  MISSILE_OIL_COST,
  MISSILE_IRON_COST,
  TERRITORY_RESOURCES,
  NATIONAL_FOCUSES,
};
