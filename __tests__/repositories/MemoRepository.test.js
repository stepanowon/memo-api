const {
  createLokiMemoRepository,
} = require("../../repositories/MemoRepository");
const { createTestMemo, createTestMemos } = require("../helpers/testHelpers");

describe("MemoRepository", () => {
  let memoRepository;
  let mockCollection;
  let mockDatabase;

  beforeEach(() => {
    // Mock LokiJS collection
    mockCollection = {
      find: jest.fn(),
      findOne: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    // Mock LokiJS database
    mockDatabase = {
      saveDatabase: jest.fn(),
    };

    memoRepository = createLokiMemoRepository(mockCollection, mockDatabase);
  });

  describe("findAll", () => {
    it("모든 메모를 regdate 역순으로 정렬하여 반환해야 함", async () => {
      // Given
      const testMemos = [
        createTestMemo({ id: "1", regdate: 1000 }),
        createTestMemo({ id: "2", regdate: 3000 }),
        createTestMemo({ id: "3", regdate: 2000 }),
      ];
      mockCollection.find.mockReturnValue(testMemos);

      // When
      const result = await memoRepository.findAll(1, 10);

      // Then
      expect(result).toHaveLength(3);
      expect(result[0].id).toBe("2"); // 가장 최근 (regdate: 3000)
      expect(result[1].id).toBe("3"); // 중간 (regdate: 2000)
      expect(result[2].id).toBe("1"); // 가장 오래된 (regdate: 1000)
    });

    it("페이징이 올바르게 적용되어야 함", async () => {
      // Given
      const testMemos = createTestMemos(15);
      mockCollection.find.mockReturnValue(testMemos);

      // When
      const result = await memoRepository.findAll(2, 5);

      // Then
      expect(result).toHaveLength(5);
      expect(mockCollection.find).toHaveBeenCalled();
    });

    it("기본 페이징 값으로 동작해야 함", async () => {
      // Given
      const testMemos = createTestMemos(3);
      mockCollection.find.mockReturnValue(testMemos);

      // When
      const result = await memoRepository.findAll();

      // Then
      expect(result).toHaveLength(3);
      expect(mockCollection.find).toHaveBeenCalled();
    });

    it("LokiJS 메타데이터를 제거해야 함", async () => {
      // Given
      const testMemoWithMeta = {
        ...createTestMemo(),
        $loki: 1,
        meta: { created: 1234567890 },
      };
      mockCollection.find.mockReturnValue([testMemoWithMeta]);

      // When
      const result = await memoRepository.findAll(1, 10);

      // Then
      expect(result[0]).not.toHaveProperty("$loki");
      expect(result[0]).not.toHaveProperty("meta");
    });
  });

  describe("findById", () => {
    it("ID로 메모를 성공적으로 찾아야 함", async () => {
      // Given
      const testMemo = createTestMemo();
      mockCollection.findOne.mockReturnValue(testMemo);

      // When
      const result = await memoRepository.findById(testMemo.id);

      // Then
      expect(result).toEqual(testMemo);
      expect(mockCollection.findOne).toHaveBeenCalledWith({ id: testMemo.id });
    });

    it("존재하지 않는 ID에 대해 null을 반환해야 함", async () => {
      // Given
      mockCollection.findOne.mockReturnValue(null);

      // When
      const result = await memoRepository.findById("non-existent-id");

      // Then
      expect(result).toBeNull();
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        id: "non-existent-id",
      });
    });

    it("LokiJS 메타데이터를 제거해야 함", async () => {
      // Given
      const testMemoWithMeta = {
        ...createTestMemo(),
        $loki: 1,
        meta: { created: 1234567890 },
      };
      mockCollection.findOne.mockReturnValue(testMemoWithMeta);

      // When
      const result = await memoRepository.findById("test-id");

      // Then
      expect(result).not.toHaveProperty("$loki");
      expect(result).not.toHaveProperty("meta");
    });
  });

  describe("create", () => {
    it("새 메모를 성공적으로 생성해야 함", async () => {
      // Given
      const newMemo = createTestMemo();
      const insertedMemo = { ...newMemo, $loki: 1 };
      mockCollection.insert.mockReturnValue(insertedMemo);

      // When
      const result = await memoRepository.create(newMemo);

      // Then
      expect(result).toEqual(newMemo);
      expect(mockCollection.insert).toHaveBeenCalledWith(newMemo);
      expect(mockDatabase.saveDatabase).toHaveBeenCalled();
    });

    it("LokiJS 메타데이터를 제거하여 반환해야 함", async () => {
      // Given
      const newMemo = createTestMemo();
      const insertedMemoWithMeta = {
        ...newMemo,
        $loki: 1,
        meta: { created: 1234567890 },
      };
      mockCollection.insert.mockReturnValue(insertedMemoWithMeta);

      // When
      const result = await memoRepository.create(newMemo);

      // Then
      expect(result).not.toHaveProperty("$loki");
      expect(result).not.toHaveProperty("meta");
    });
  });

  describe("update", () => {
    it("기존 메모를 성공적으로 업데이트해야 함", async () => {
      // Given
      const existingMemo = createTestMemo();
      const updates = { title: "Updated Title", content: "Updated Content" };
      mockCollection.findOne.mockReturnValue(existingMemo);
      mockCollection.update.mockReturnValue(true);

      // When
      const result = await memoRepository.update(existingMemo.id, updates);

      // Then
      expect(result.title).toBe("Updated Title");
      expect(result.content).toBe("Updated Content");
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        id: existingMemo.id,
      });
      expect(mockCollection.update).toHaveBeenCalledWith(existingMemo);
      expect(mockDatabase.saveDatabase).toHaveBeenCalled();
    });

    it("존재하지 않는 메모 업데이트 시 null을 반환해야 함", async () => {
      // Given
      mockCollection.findOne.mockReturnValue(null);

      // When
      const result = await memoRepository.update("non-existent-id", {
        title: "New Title",
      });

      // Then
      expect(result).toBeNull();
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        id: "non-existent-id",
      });
      expect(mockCollection.update).not.toHaveBeenCalled();
      expect(mockDatabase.saveDatabase).not.toHaveBeenCalled();
    });

    it("undefined 값은 업데이트하지 않아야 함", async () => {
      // Given
      const existingMemo = createTestMemo({
        title: "Original Title",
        content: "Original Content",
      });
      const updates = { title: "New Title", content: undefined };
      mockCollection.findOne.mockReturnValue(existingMemo);

      // When
      const result = await memoRepository.update(existingMemo.id, updates);

      // Then
      expect(result.title).toBe("New Title");
      expect(result.content).toBe("Original Content"); // unchanged
    });

    it("LokiJS 메타데이터를 제거하여 반환해야 함", async () => {
      // Given
      const existingMemoWithMeta = {
        ...createTestMemo(),
        $loki: 1,
        meta: { created: 1234567890 },
      };
      mockCollection.findOne.mockReturnValue(existingMemoWithMeta);

      // When
      const result = await memoRepository.update("test-id", {
        title: "New Title",
      });

      // Then
      expect(result).not.toHaveProperty("$loki");
      expect(result).not.toHaveProperty("meta");
    });
  });

  describe("delete", () => {
    it("기존 메모를 성공적으로 삭제해야 함", async () => {
      // Given
      const existingMemo = createTestMemo();
      mockCollection.findOne.mockReturnValue(existingMemo);
      mockCollection.remove.mockReturnValue(true);

      // When
      const result = await memoRepository.delete(existingMemo.id);

      // Then
      expect(result).toBe(true);
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        id: existingMemo.id,
      });
      expect(mockCollection.remove).toHaveBeenCalledWith(existingMemo);
      expect(mockDatabase.saveDatabase).toHaveBeenCalled();
    });

    it("존재하지 않는 메모 삭제 시 false를 반환해야 함", async () => {
      // Given
      mockCollection.findOne.mockReturnValue(null);

      // When
      const result = await memoRepository.delete("non-existent-id");

      // Then
      expect(result).toBe(false);
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        id: "non-existent-id",
      });
      expect(mockCollection.remove).not.toHaveBeenCalled();
      expect(mockDatabase.saveDatabase).not.toHaveBeenCalled();
    });
  });
});
