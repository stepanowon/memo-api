// LokiJS 구현체 (함수형)
const createLokiMemoRepository = (collection, database) => {
  const stripLokiFields = (obj) => {
    if (!obj) return obj;
    const { $loki, meta, ...rest } = obj;
    return rest;
  };

  const findAll = async (page = 1, pageSize = 10) => {
    const all = collection.find();
    // regdate 역순 정렬
    all.sort((a, b) => b.regdate - a.regdate);
    // 페이징
    const start = (page - 1) * pageSize;
    const paged = all.slice(start, start + pageSize);
    return paged.map((memo) => stripLokiFields(memo));
  };

  const findById = async (id) => {
    const memo = collection.findOne({ id });
    return stripLokiFields(memo);
  };

  const create = async (memo) => {
    const insertedMemo = collection.insert(memo);
    database.saveDatabase();
    return stripLokiFields(insertedMemo);
  };

  const update = async (id, updates) => {
    const memo = collection.findOne({ id });
    if (!memo) return null;

    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        memo[key] = updates[key];
      }
    });

    collection.update(memo);
    database.saveDatabase();
    return stripLokiFields(memo);
  };

  const deleteById = async (id) => {
    const memo = collection.findOne({ id });
    if (!memo) return false;

    collection.remove(memo);
    database.saveDatabase();
    return true;
  };

  return {
    findAll,
    findById,
    create,
    update,
    delete: deleteById,
  };
};

module.exports = {
  createLokiMemoRepository,
};
