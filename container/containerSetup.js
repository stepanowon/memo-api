const createDIContainer = require("./DIContainer");
const databaseConfig = require("../config/database");
const createSwaggerConfig = require("../config/swagger");
const { createLokiMemoRepository } = require("../repositories/MemoRepository");
const createMemoValidationService = require("../services/MemoValidationService");
const createMemoReadService = require("../services/MemoReadService");
const createMemoWriteService = require("../services/MemoWriteService");

const setupContainer = async (port = 3000) => {
  const container = createDIContainer();

  // 데이터베이스 설정 등록
  container.register("databaseConfig", () => databaseConfig, {
    singleton: true,
  });

  // Swagger 설정 등록
  container.register("swaggerConfig", () => createSwaggerConfig(port), {
    singleton: true,
  });

  // 데이터베이스 초기화 및 Repository 등록
  const database = await databaseConfig.initialize();
  const memosCollection = databaseConfig.getCollection("memos");

  container.register(
    "memoRepository",
    () => createLokiMemoRepository(memosCollection, database),
    { singleton: true }
  );

  // 서비스들 등록
  container.register(
    "memoValidationService",
    () => createMemoValidationService(),
    { singleton: true }
  );

  container.register(
    "memoReadService",
    (container) => createMemoReadService(container.resolve("memoRepository")),
    { singleton: true }
  );

  container.register(
    "memoWriteService",
    (container) => createMemoWriteService(container.resolve("memoRepository")),
    { singleton: true }
  );

  return container;
};

module.exports = { setupContainer };
