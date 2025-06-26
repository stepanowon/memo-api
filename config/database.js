const Loki = require("lokijs");
const path = require("path");

// 데이터베이스 상태 관리
let dbState = {
  db: null,
  collections: {},
};

const initialize = () => {
  return new Promise((resolve, reject) => {
    dbState.db = new Loki(path.join(__dirname, "../memos.db"), {
      autoload: true,
      autoloadCallback: () => {
        initializeCollections();
        resolve(dbState.db);
      },
      autosave: true,
      autosaveInterval: 4000,
    });
  });
};

const initializeCollections = () => {
  // 메모 컬렉션 초기화
  let memos = dbState.db.getCollection("memos");
  if (memos === null) {
    memos = dbState.db.addCollection("memos", { indices: ["id"] });
  }
  dbState.collections.memos = memos;
};

const getCollection = (name) => {
  return dbState.collections[name];
};

const getDatabase = () => {
  return dbState.db;
};

// 싱글톤 패턴으로 내보내기
const databaseConfig = {
  initialize,
  initializeCollections,
  getCollection,
  getDatabase,
};

module.exports = databaseConfig;
