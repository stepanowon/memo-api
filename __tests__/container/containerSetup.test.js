const { setupContainer } = require("../../container/containerSetup");

// Mock dependencies
jest.mock("../../config/database");
jest.mock("../../config/swagger");
jest.mock("../../repositories/MemoRepository");
jest.mock("../../services/MemoValidationService");
jest.mock("../../services/MemoReadService");
jest.mock("../../services/MemoWriteService");

const databaseConfig = require("../../config/database");
const createSwaggerConfig = require("../../config/swagger");
const {
  createLokiMemoRepository,
} = require("../../repositories/MemoRepository");
const createMemoValidationService = require("../../services/MemoValidationService");
const createMemoReadService = require("../../services/MemoReadService");
const createMemoWriteService = require("../../services/MemoWriteService");

describe("containerSetup", () => {
  let mockDatabase;
  let mockMemosCollection;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock database and collection
    mockDatabase = { saveDatabase: jest.fn() };
    mockMemosCollection = {
      find: jest.fn(),
      findOne: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    // Mock database config
    databaseConfig.initialize.mockResolvedValue(mockDatabase);
    databaseConfig.getCollection.mockReturnValue(mockMemosCollection);

    // Mock swagger config
    createSwaggerConfig.mockReturnValue({ swagger: "config" });

    // Mock repository
    createLokiMemoRepository.mockReturnValue({
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    });

    // Mock services
    createMemoValidationService.mockReturnValue({
      validateCreateMemo: jest.fn(),
      validateUpdateMemo: jest.fn(),
      validatePagination: jest.fn(),
      validateMemoId: jest.fn(),
    });

    createMemoReadService.mockReturnValue({
      getAllMemos: jest.fn(),
      getMemoById: jest.fn(),
      getMemoExists: jest.fn(),
    });

    createMemoWriteService.mockReturnValue({
      createMemo: jest.fn(),
      updateMemo: jest.fn(),
      deleteMemo: jest.fn(),
    });
  });

  describe("setupContainer", () => {
    it("모든 의존성을 올바르게 등록해야 함", async () => {
      // When
      const container = await setupContainer();

      // Then
      expect(container).toBeDefined();
      expect(typeof container.resolve).toBe("function");
      expect(typeof container.register).toBe("function");
    });

    it("데이터베이스를 초기화해야 함", async () => {
      // When
      await setupContainer();

      // Then
      expect(databaseConfig.initialize).toHaveBeenCalledTimes(1);
      expect(databaseConfig.getCollection).toHaveBeenCalledWith("memos");
    });

    it("기본 포트(3000)로 Swagger 설정을 등록해야 함", async () => {
      // When
      const container = await setupContainer();
      const swaggerConfig = container.resolve("swaggerConfig");

      // Then
      expect(createSwaggerConfig).toHaveBeenCalledWith(3000);
      expect(swaggerConfig).toEqual({ swagger: "config" });
    });

    it("사용자 지정 포트로 Swagger 설정을 등록해야 함", async () => {
      // When
      const container = await setupContainer(8080);
      container.resolve("swaggerConfig");

      // Then
      expect(createSwaggerConfig).toHaveBeenCalledWith(8080);
    });

    it("데이터베이스 설정을 싱글톤으로 등록해야 함", async () => {
      // When
      const container = await setupContainer();

      // Then
      const databaseConfig1 = container.resolve("databaseConfig");
      const databaseConfig2 = container.resolve("databaseConfig");
      expect(databaseConfig1).toBe(databaseConfig2);
    });

    it("메모 리포지토리를 올바르게 등록해야 함", async () => {
      // When
      const container = await setupContainer();
      const repository = container.resolve("memoRepository");

      // Then
      expect(createLokiMemoRepository).toHaveBeenCalledWith(
        mockMemosCollection,
        mockDatabase
      );

      expect(repository).toBeDefined();
      expect(repository.findAll).toBeDefined();
      expect(repository.findById).toBeDefined();
      expect(repository.create).toBeDefined();
      expect(repository.update).toBeDefined();
      expect(repository.delete).toBeDefined();
    });

    it("모든 서비스를 올바르게 등록해야 함", async () => {
      // When
      const container = await setupContainer();

      // Resolve services to trigger factory calls
      const validationService = container.resolve("memoValidationService");
      const readService = container.resolve("memoReadService");
      const writeService = container.resolve("memoWriteService");

      // Then
      // Validation Service
      expect(createMemoValidationService).toHaveBeenCalledTimes(1);
      expect(validationService).toBeDefined();

      // Read Service
      expect(createMemoReadService).toHaveBeenCalledTimes(1);
      expect(readService).toBeDefined();

      // Write Service
      expect(createMemoWriteService).toHaveBeenCalledTimes(1);
      expect(writeService).toBeDefined();
    });

    it("서비스들이 의존성 주입을 통해 리포지토리를 받아야 함", async () => {
      // When
      const container = await setupContainer();

      // Resolve services to trigger factory calls
      const readService = container.resolve("memoReadService");
      const writeService = container.resolve("memoWriteService");

      // Then
      // Read Service가 repository를 받았는지 확인
      expect(createMemoReadService).toHaveBeenCalledWith(
        expect.objectContaining({
          findAll: expect.any(Function),
          findById: expect.any(Function),
          create: expect.any(Function),
          update: expect.any(Function),
          delete: expect.any(Function),
        })
      );

      // Write Service가 repository를 받았는지 확인
      expect(createMemoWriteService).toHaveBeenCalledWith(
        expect.objectContaining({
          findAll: expect.any(Function),
          findById: expect.any(Function),
          create: expect.any(Function),
          update: expect.any(Function),
          delete: expect.any(Function),
        })
      );
    });

    it("모든 서비스가 싱글톤으로 등록되어야 함", async () => {
      // When
      const container = await setupContainer();

      // Then
      const validationService1 = container.resolve("memoValidationService");
      const validationService2 = container.resolve("memoValidationService");
      expect(validationService1).toBe(validationService2);

      const readService1 = container.resolve("memoReadService");
      const readService2 = container.resolve("memoReadService");
      expect(readService1).toBe(readService2);

      const writeService1 = container.resolve("memoWriteService");
      const writeService2 = container.resolve("memoWriteService");
      expect(writeService1).toBe(writeService2);

      const repository1 = container.resolve("memoRepository");
      const repository2 = container.resolve("memoRepository");
      expect(repository1).toBe(repository2);
    });

    it("데이터베이스 초기화 실패 시 에러를 전파해야 함", async () => {
      // Given
      const dbError = new Error("Database initialization failed");
      databaseConfig.initialize.mockRejectedValue(dbError);

      // When & Then
      await expect(setupContainer()).rejects.toThrow(
        "Database initialization failed"
      );
    });

    it("컨테이너가 의존성 검증을 통과해야 함", async () => {
      // When
      const container = await setupContainer();

      // Then
      expect(container.validateDependencies()).toBe(true);
    });

    it("등록된 모든 의존성을 해결할 수 있어야 함", async () => {
      // When
      const container = await setupContainer();

      // Then
      expect(() => container.resolve("databaseConfig")).not.toThrow();
      expect(() => container.resolve("swaggerConfig")).not.toThrow();
      expect(() => container.resolve("memoRepository")).not.toThrow();
      expect(() => container.resolve("memoValidationService")).not.toThrow();
      expect(() => container.resolve("memoReadService")).not.toThrow();
      expect(() => container.resolve("memoWriteService")).not.toThrow();
    });

    it("서비스 간 의존성 주입이 올바르게 작동해야 함", async () => {
      // When
      const container = await setupContainer();

      // Then
      const readService = container.resolve("memoReadService");
      const writeService = container.resolve("memoWriteService");
      const repository = container.resolve("memoRepository");

      // 서비스들이 같은 repository 인스턴스를 사용하는지 확인
      expect(createMemoReadService).toHaveBeenCalledWith(repository);
      expect(createMemoWriteService).toHaveBeenCalledWith(repository);
    });

    it("여러 번 호출해도 독립적인 컨테이너를 반환해야 함", async () => {
      // When
      const container1 = await setupContainer();
      const container2 = await setupContainer();

      // Then
      expect(container1).not.toBe(container2);

      // 각각 독립적으로 동작해야 함
      container1.register("testService", () => ({ name: "test1" }));
      expect(() => container2.resolve("testService")).toThrow();
    });
  });

  describe("integration scenarios", () => {
    it("실제 의존성 주입 시나리오를 시뮬레이션해야 함", async () => {
      // Given
      const mockRepository = {
        findById: jest
          .fn()
          .mockResolvedValue({ id: "test-id", title: "Test Memo" }),
      };
      createLokiMemoRepository.mockReturnValue(mockRepository);

      const mockReadService = {
        getMemoById: jest
          .fn()
          .mockResolvedValue({ id: "test-id", title: "Test Memo" }),
      };
      createMemoReadService.mockImplementation((repo) => {
        // 실제 repository를 받았는지 확인
        expect(repo).toBe(mockRepository);
        return mockReadService;
      });

      // When
      const container = await setupContainer();
      const readService = container.resolve("memoReadService");

      // Then
      expect(readService).toBe(mockReadService);
      expect(createMemoReadService).toHaveBeenCalledWith(mockRepository);
    });

    it("모든 서비스가 동일한 데이터베이스 인스턴스를 공유해야 함", async () => {
      // When
      const container = await setupContainer();

      // Resolve all services to trigger factory calls
      const repository = container.resolve("memoRepository");
      const readService = container.resolve("memoReadService");
      const writeService = container.resolve("memoWriteService");

      // Then
      expect(createLokiMemoRepository).toHaveBeenCalledWith(
        mockMemosCollection,
        mockDatabase
      );

      // 모든 서비스가 같은 repository를 통해 같은 데이터베이스에 접근
      expect(createMemoReadService).toHaveBeenCalledWith(repository);
      expect(createMemoWriteService).toHaveBeenCalledWith(repository);
    });
  });
});
