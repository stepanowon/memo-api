const createMemoReadService = require("../../services/MemoReadService");
const { createTestMemo, createTestMemos } = require("../helpers/testHelpers");

describe("MemoReadService", () => {
  let memoReadService;
  let mockMemoRepository;

  beforeEach(() => {
    mockMemoRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
    };
    memoReadService = createMemoReadService(mockMemoRepository);
  });

  describe("getAllMemos", () => {
    it("모든 메모를 성공적으로 조회해야 함", async () => {
      // Given
      const testMemos = createTestMemos(3);
      mockMemoRepository.findAll.mockResolvedValue(testMemos);

      // When
      const result = await memoReadService.getAllMemos(1, 10);

      // Then
      expect(result).toHaveLength(3);
      expect(mockMemoRepository.findAll).toHaveBeenCalledWith(1, 10);

      // 도메인 엔터티 메서드가 추가되었는지 확인
      result.forEach((memo) => {
        expect(memo).toHaveProperty("wordCount");
        expect(memo).toHaveProperty("canBeModified");
        expect(memo).toHaveProperty("isExpired");
        expect(typeof memo.wordCount).toBe("number");
        expect(typeof memo.canBeModified).toBe("boolean");
        expect(typeof memo.isExpired).toBe("boolean");
      });
    });

    it("기본 페이징 값으로 메모를 조회해야 함", async () => {
      // Given
      const testMemos = createTestMemos(2);
      mockMemoRepository.findAll.mockResolvedValue(testMemos);

      // When
      const result = await memoReadService.getAllMemos();

      // Then
      expect(mockMemoRepository.findAll).toHaveBeenCalledWith(1, 10);
      expect(result).toHaveLength(2);
    });

    it("Repository 에러 시 적절한 에러 메시지를 반환해야 함", async () => {
      // Given
      const repositoryError = new Error("Database connection failed");
      mockMemoRepository.findAll.mockRejectedValue(repositoryError);

      // When & Then
      await expect(memoReadService.getAllMemos(1, 10)).rejects.toThrow(
        "메모 목록 조회 중 오류가 발생했습니다: Database connection failed"
      );
    });
  });

  describe("getMemoById", () => {
    it("ID로 메모를 성공적으로 조회해야 함", async () => {
      // Given
      const testMemo = createTestMemo();
      mockMemoRepository.findById.mockResolvedValue(testMemo);

      // When
      const result = await memoReadService.getMemoById(testMemo.id);

      // Then
      expect(result).toBeDefined();
      expect(result.id).toBe(testMemo.id);
      expect(result.title).toBe(testMemo.title);
      expect(result.content).toBe(testMemo.content);
      expect(mockMemoRepository.findById).toHaveBeenCalledWith(testMemo.id);

      // 도메인 엔터티 메서드가 추가되었는지 확인
      expect(result).toHaveProperty("wordCount");
      expect(result).toHaveProperty("canBeModified");
      expect(result).toHaveProperty("isExpired");
    });

    it("존재하지 않는 메모 ID에 대해 null을 반환해야 함", async () => {
      // Given
      mockMemoRepository.findById.mockResolvedValue(null);

      // When
      const result = await memoReadService.getMemoById("non-existent-id");

      // Then
      expect(result).toBeNull();
      expect(mockMemoRepository.findById).toHaveBeenCalledWith(
        "non-existent-id"
      );
    });

    it("ID가 제공되지 않으면 에러를 발생시켜야 함", async () => {
      // When & Then
      await expect(memoReadService.getMemoById(null)).rejects.toThrow(
        "메모 조회 중 오류가 발생했습니다: 메모 ID가 필요합니다."
      );

      await expect(memoReadService.getMemoById(undefined)).rejects.toThrow(
        "메모 조회 중 오류가 발생했습니다: 메모 ID가 필요합니다."
      );

      await expect(memoReadService.getMemoById("")).rejects.toThrow(
        "메모 조회 중 오류가 발생했습니다: 메모 ID가 필요합니다."
      );
    });

    it("Repository 에러 시 적절한 에러 메시지를 반환해야 함", async () => {
      // Given
      const repositoryError = new Error("Database connection failed");
      mockMemoRepository.findById.mockRejectedValue(repositoryError);

      // When & Then
      await expect(memoReadService.getMemoById("test-id")).rejects.toThrow(
        "메모 조회 중 오류가 발생했습니다: Database connection failed"
      );
    });
  });

  describe("getMemoExists", () => {
    it("메모가 존재하면 true를 반환해야 함", async () => {
      // Given
      const testMemo = createTestMemo();
      mockMemoRepository.findById.mockResolvedValue(testMemo);

      // When
      const result = await memoReadService.getMemoExists(testMemo.id);

      // Then
      expect(result).toBe(true);
    });

    it("메모가 존재하지 않으면 false를 반환해야 함", async () => {
      // Given
      mockMemoRepository.findById.mockResolvedValue(null);

      // When
      const result = await memoReadService.getMemoExists("non-existent-id");

      // Then
      expect(result).toBe(false);
    });

    it("에러 발생 시 false를 반환해야 함", async () => {
      // Given
      mockMemoRepository.findById.mockRejectedValue(
        new Error("Database error")
      );

      // When
      const result = await memoReadService.getMemoExists("test-id");

      // Then
      expect(result).toBe(false);
    });
  });
});
