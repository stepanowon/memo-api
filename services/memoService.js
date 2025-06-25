const { v4: uuidv4 } = require("uuid");
let memos, db;

function init(memosCollection, dbInstance) {
  memos = memosCollection;
  db = dbInstance;
}

function stripLokiFields(obj) {
  if (!obj) return obj;
  const { $loki, meta, ...rest } = obj;
  return rest;
}

function getAllMemos(page = 1, pageSize = 10) {
  const all = memos.find();
  // regdate 역순 정렬
  all.sort((a, b) => b.regdate - a.regdate);
  // 페이징
  const start = (page - 1) * pageSize;
  const paged = all.slice(start, start + pageSize);
  return paged.map(stripLokiFields);
}

function createMemo(title, content) {
  const memo = {
    id: uuidv4(),
    title,
    content,
    regdate: Date.now(),
  };
  memos.insert(memo);
  db.saveDatabase();
  return stripLokiFields(memo);
}

function getMemoById(id) {
  return stripLokiFields(memos.findOne({ id }));
}

function updateMemo(id, title, content) {
  const memo = memos.findOne({ id });
  if (!memo) return null;
  if (title !== undefined) memo.title = title;
  if (content !== undefined) memo.content = content;
  memos.update(memo);
  db.saveDatabase();
  return stripLokiFields(memo);
}

function deleteMemo(id) {
  const memo = memos.findOne({ id });
  if (!memo) return false;
  memos.remove(memo);
  db.saveDatabase();
  return true;
}

module.exports = {
  init,
  getAllMemos,
  createMemo,
  getMemoById,
  updateMemo,
  deleteMemo,
};
