const databaseConfig = require("../../config/database");
const Loki = require("lokijs");
const path = require("path");

// Mock LokiJS
jest.mock("lokijs");

describe("Database Config", () => {
  let mockDb;
  let mockMemosCollection;

  beforeEach(() => {
    // Mock collection
    mockMemosCollection = {
      find: jest.fn(),
      findOne: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    // Mock database
    mockDb = {
      getCollection: jest.fn(),
      addCollection: jest.fn(),
      saveDatabase: jest.fn(),
    };

    // Mock Loki constructor
    Loki.mockImplementation((dbPath, options) => {
      // 비동기 콜백 시뮬레이션
      setTimeout(() => {
        if (options.autoloadCallback) {
          options.autoloadCallback();
        }
      }, 0);
      return mockDb;
    });

    // Reset database state
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Reset internal state if needed
    jest.resetModules();
  });

  describe("initialize", () => {
    it("LokiJS 데이터베이스를 올바른 경로로 초기화해야 함", async () => {
      // Given
      const expectedPath = path.join(__dirname, "../../memos.db");
      mockDb.getCollection.mockReturnValue(null);
      mockDb.addCollection.mockReturnValue(mockMemosCollection);

      // When
      const result = await databaseConfig.initialize();

      // Then
      expect(Loki).toHaveBeenCalledWith(expectedPath, {
        autoload: true,
        autoloadCallback: expect.any(Function),
        autosave: true,
        autosaveInterval: 4000,
      });
      expect(result).toBe(mockDb);
    });

    it("autoload 옵션이 활성화되어야 함", async () => {
      // Given
      mockDb.getCollection.mockReturnValue(null);
      mockDb.addCollection.mockReturnValue(mockMemosCollection);

      // When
      await databaseConfig.initialize();

      // Then
      expect(Loki).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          autoload: true,
          autoloadCallback: expect.any(Function),
        })
      );
    });

    it("autosave 옵션이 올바르게 설정되어야 함", async () => {
      // Given
      mockDb.getCollection.mockReturnValue(null);
      mockDb.addCollection.mockReturnValue(mockMemosCollection);

      // When
      await databaseConfig.initialize();

      // Then
      expect(Loki).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          autosave: true,
          autosaveInterval: 4000,
        })
      );
    });

    it("초기화 완료 후 데이터베이스 인스턴스를 반환해야 함", async () => {
      // Given
      mockDb.getCollection.mockReturnValue(null);
      mockDb.addCollection.mockReturnValue(mockMemosCollection);

      // When
      const result = await databaseConfig.initialize();

      // Then
      expect(result).toBe(mockDb);
      expect(result).toBeInstanceOf(Object);
    });

    it("autoloadCallback이 호출되면 컬렉션을 초기화해야 함", async () => {
      // Given
      mockDb.getCollection.mockReturnValue(null);
      mockDb.addCollection.mockReturnValue(mockMemosCollection);

      // When
      await databaseConfig.initialize();

      // Then
      expect(mockDb.getCollection).toHaveBeenCalledWith("memos");
      expect(mockDb.addCollection).toHaveBeenCalledWith("memos", {
        indices: ["id"],
      });
    });
  });

  describe("initializeCollections", () => {
    beforeEach(async () => {
      // 데이터베이스 초기화
      mockDb.getCollection.mockReturnValue(null);
      mockDb.addCollection.mockReturnValue(mockMemosCollection);
      await databaseConfig.initialize();
    });

    it("존재하지 않는 memos 컬렉션을 생성해야 함", () => {
      // Given - 이미 beforeEach에서 설정됨
      mockDb.getCollection.mockReturnValue(null);
      mockDb.addCollection.mockReturnValue(mockMemosCollection);

      // When
      databaseConfig.initializeCollections();

      // Then
      expect(mockDb.getCollection).toHaveBeenCalledWith("memos");
      expect(mockDb.addCollection).toHaveBeenCalledWith("memos", {
        indices: ["id"],
      });
    });

    it("이미 존재하는 memos 컬렉션은 재사용해야 함", () => {
      // Given
      mockDb.getCollection.mockReturnValue(mockMemosCollection);
      mockDb.addCollection.mockClear(); // 이전 호출 기록 제거

      // When
      databaseConfig.initializeCollections();

      // Then
      expect(mockDb.getCollection).toHaveBeenCalledWith("memos");
      expect(mockDb.addCollection).not.toHaveBeenCalled();
    });

    it("컬렉션에 id 인덱스가 설정되어야 함", () => {
      // Given
      mockDb.getCollection.mockReturnValue(null);
      mockDb.addCollection.mockReturnValue(mockMemosCollection);

      // When
      databaseConfig.initializeCollections();

      // Then
      expect(mockDb.addCollection).toHaveBeenCalledWith("memos", {
        indices: ["id"],
      });
    });
  });

  describe("getCollection", () => {
    beforeEach(async () => {
      // 데이터베이스 초기화
      mockDb.getCollection.mockReturnValue(null);
      mockDb.addCollection.mockReturnValue(mockMemosCollection);
      await databaseConfig.initialize();
    });

    it("존재하는 컬렉션을 반환해야 함", () => {
      // When
      const result = databaseConfig.getCollection("memos");

      // Then
      expect(result).toBe(mockMemosCollection);
    });

    it("존재하지 않는 컬렉션에 대해 undefined를 반환해야 함", () => {
      // When
      const result = databaseConfig.getCollection("nonexistent");

      // Then
      expect(result).toBeUndefined();
    });

    it("컬렉션 이름이 문자열이어야 함", () => {
      // When
      const result1 = databaseConfig.getCollection("memos");
      const result2 = databaseConfig.getCollection("");

      // Then
      expect(result1).toBe(mockMemosCollection);
      expect(result2).toBeUndefined();
    });
  });

  describe("getDatabase", () => {
    it("초기화 전에는 null을 반환해야 함", () => {
      // Given - 새로운 인스턴스 로드
      jest.resetModules();
      const freshDatabaseConfig = require("../../config/database");

      // When
      const result = freshDatabaseConfig.getDatabase();

      // Then
      expect(result).toBeNull();
    });

    it("초기화 후에는 데이터베이스 인스턴스를 반환해야 함", async () => {
      // Given
      mockDb.getCollection.mockReturnValue(null);
      mockDb.addCollection.mockReturnValue(mockMemosCollection);

      // When
      await databaseConfig.initialize();
      const result = databaseConfig.getDatabase();

      // Then
      expect(result).toBe(mockDb);
    });
  });

  describe("싱글톤 패턴", () => {
    it("모듈이 싱글톤으로 동작해야 함", () => {
      // Given
      const config1 = require("../../config/database");
      const config2 = require("../../config/database");

      // Then
      expect(config1).toBe(config2);
      expect(config1.initialize).toBe(config2.initialize);
      expect(config1.getCollection).toBe(config2.getCollection);
      expect(config1.getDatabase).toBe(config2.getDatabase);
    });

    it("여러 번 초기화해도 같은 데이터베이스 인스턴스를 사용해야 함", async () => {
      // Given
      mockDb.getCollection.mockReturnValue(null);
      mockDb.addCollection.mockReturnValue(mockMemosCollection);

      // When
      const db1 = await databaseConfig.initialize();
      const db2 = await databaseConfig.initialize();

      // Then
      expect(db1).toBe(db2);
      expect(databaseConfig.getDatabase()).toBe(db1);
    });
  });

  describe("integration scenarios", () => {
    it("전체 초기화 플로우가 올바르게 동작해야 함", async () => {
      // Given
      mockDb.getCollection.mockReturnValue(null);
      mockDb.addCollection.mockReturnValue(mockMemosCollection);

      // When
      const db = await databaseConfig.initialize();

      // Then
      // 데이터베이스 초기화 확인
      expect(db).toBe(mockDb);
      expect(databaseConfig.getDatabase()).toBe(mockDb);

      // 컬렉션 초기화 확인
      expect(mockDb.getCollection).toHaveBeenCalledWith("memos");
      expect(mockDb.addCollection).toHaveBeenCalledWith("memos", {
        indices: ["id"],
      });

      // 컬렉션 접근 확인
      const memosCollection = databaseConfig.getCollection("memos");
      expect(memosCollection).toBe(mockMemosCollection);
    });

    it("데이터베이스 경로가 올바르게 설정되어야 함", async () => {
      // Given
      const expectedPath = path.join(__dirname, "../../memos.db");
      mockDb.getCollection.mockReturnValue(null);
      mockDb.addCollection.mockReturnValue(mockMemosCollection);

      // When
      await databaseConfig.initialize();

      // Then
      expect(Loki).toHaveBeenCalledWith(expectedPath, expect.any(Object));
    });

    it("autosave 설정이 올바르게 적용되어야 함", async () => {
      // Given
      mockDb.getCollection.mockReturnValue(null);
      mockDb.addCollection.mockReturnValue(mockMemosCollection);

      // When
      await databaseConfig.initialize();

      // Then
      expect(Loki).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          autosave: true,
          autosaveInterval: 4000,
        })
      );
    });

    it("컬렉션 상태가 올바르게 관리되어야 함", async () => {
      // Given
      mockDb.getCollection.mockReturnValue(null);
      mockDb.addCollection.mockReturnValue(mockMemosCollection);

      // When
      await databaseConfig.initialize();

      // Then
      const memosCollection = databaseConfig.getCollection("memos");
      expect(memosCollection).toBe(mockMemosCollection);
      expect(memosCollection).toHaveProperty("find");
      expect(memosCollection).toHaveProperty("findOne");
      expect(memosCollection).toHaveProperty("insert");
      expect(memosCollection).toHaveProperty("update");
      expect(memosCollection).toHaveProperty("remove");
    });
  });

  describe("error handling", () => {
    it("Loki 초기화 실패 시 에러를 처리해야 함", async () => {
      // Given
      const error = new Error("Database initialization failed");
      Loki.mockImplementation(() => {
        throw error;
      });

      // When & Then
      await expect(databaseConfig.initialize()).rejects.toThrow(
        "Database initialization failed"
      );
    });

    it("여러 번 초기화해도 안전해야 함", async () => {
      // Given
      mockDb.getCollection.mockReturnValue(null);
      mockDb.addCollection.mockReturnValue(mockMemosCollection);

      // When
      const result1 = await databaseConfig.initialize();
      const result2 = await databaseConfig.initialize();

      // Then
      expect(result1).toBe(mockDb);
      expect(result2).toBe(mockDb);
      expect(result1).toBe(result2);
    });
  });

  describe("configuration validation", () => {
    it("LokiJS 설정이 올바른 타입이어야 함", async () => {
      // Given
      mockDb.getCollection.mockReturnValue(null);
      mockDb.addCollection.mockReturnValue(mockMemosCollection);

      // When
      await databaseConfig.initialize();

      // Then
      const [, options] = Loki.mock.calls[0];
      expect(typeof options.autoload).toBe("boolean");
      expect(typeof options.autosave).toBe("boolean");
      expect(typeof options.autosaveInterval).toBe("number");
      expect(typeof options.autoloadCallback).toBe("function");
    });

    it("autosaveInterval이 양수여야 함", async () => {
      // Given
      mockDb.getCollection.mockReturnValue(null);
      mockDb.addCollection.mockReturnValue(mockMemosCollection);

      // When
      await databaseConfig.initialize();

      // Then
      const [, options] = Loki.mock.calls[0];
      expect(options.autosaveInterval).toBeGreaterThan(0);
      expect(options.autosaveInterval).toBe(4000);
    });
  });
});
