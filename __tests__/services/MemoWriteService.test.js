const createMemoWriteService = require("../../services/MemoWriteService");
const { createTestMemo } = require("../helpers/testHelpers");

describe("MemoWriteService", () => {
  let memoWriteService;
  let mockMemoRepository;

  beforeEach(() => {
    mockMemoRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    memoWriteService = createMemoWriteService(mockMemoRepository);
  });

  describe("createMemo", () => {
    it("새로운 메모를 성공적으로 생성해야 함", async () => {
      // Given
      const title = "테스트 제목";
      const content = "테스트 내용";
      const createdMemo = createTestMemo({ title, content });
      mockMemoRepository.create.mockResolvedValue(createdMemo);

      // When
      const result = await memoWriteService.createMemo(title, content);

      // Then
      expect(result).toEqual(createdMemo);
      expect(mockMemoRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title,
          content,
          id: expect.any(String),
          regdate: expect.any(Number),
        })
      );
    });

    it("Repository 에러 시 적절한 에러 메시지를 반환해야 함", async () => {
      // Given
      const repositoryError = new Error("Database connection failed");
      mockMemoRepository.create.mockRejectedValue(repositoryError);

      // When & Then
      await expect(memoWriteService.createMemo("제목", "내용")).rejects.toThrow(
        "메모 생성 중 오류가 발생했습니다: Database connection failed"
      );
    });

    it("도메인 엔터티 생성 에러 시 적절한 에러 메시지를 반환해야 함", async () => {
      // When & Then
      await expect(memoWriteService.createMemo("", "")).rejects.toThrow(
        "메모 생성 중 오류가 발생했습니다:"
      );
    });
  });

  describe("updateMemo", () => {
    it("메모를 성공적으로 수정해야 함", async () => {
      // Given
      const memoId = "test-memo-id";
      const newTitle = "수정된 제목";
      const newContent = "수정된 내용";
      const existingMemo = createTestMemo({ id: memoId });
      const updatedMemo = createTestMemo({
        id: memoId,
        title: newTitle,
        content: newContent,
      });

      mockMemoRepository.findById.mockResolvedValue(existingMemo);
      mockMemoRepository.update.mockResolvedValue(updatedMemo);

      // When
      const result = await memoWriteService.updateMemo(
        memoId,
        newTitle,
        newContent
      );

      // Then
      expect(result).toEqual(updatedMemo);
      expect(mockMemoRepository.findById).toHaveBeenCalledWith(memoId);
      expect(mockMemoRepository.update).toHaveBeenCalledWith(memoId, {
        title: newTitle,
        content: newContent,
      });
    });

    it("부분 업데이트를 성공적으로 수행해야 함 (제목만 수정)", async () => {
      // Given
      const memoId = "test-memo-id";
      const newTitle = "새로운 제목";
      const existingMemo = createTestMemo({ id: memoId });
      const updatedMemo = createTestMemo({ id: memoId, title: newTitle });

      mockMemoRepository.findById.mockResolvedValue(existingMemo);
      mockMemoRepository.update.mockResolvedValue(updatedMemo);

      // When
      const result = await memoWriteService.updateMemo(
        memoId,
        newTitle,
        undefined
      );

      // Then
      expect(result).toEqual(updatedMemo);
      expect(mockMemoRepository.update).toHaveBeenCalledWith(memoId, {
        title: newTitle,
      });
    });

    it("부분 업데이트를 성공적으로 수행해야 함 (내용만 수정)", async () => {
      // Given
      const memoId = "test-memo-id";
      const newContent = "새로운 내용";
      const existingMemo = createTestMemo({ id: memoId });
      const updatedMemo = createTestMemo({ id: memoId, content: newContent });

      mockMemoRepository.findById.mockResolvedValue(existingMemo);
      mockMemoRepository.update.mockResolvedValue(updatedMemo);

      // When
      const result = await memoWriteService.updateMemo(
        memoId,
        undefined,
        newContent
      );

      // Then
      expect(result).toEqual(updatedMemo);
      expect(mockMemoRepository.update).toHaveBeenCalledWith(memoId, {
        content: newContent,
      });
    });

    it("존재하지 않는 메모에 대해 null을 반환해야 함", async () => {
      // Given
      mockMemoRepository.findById.mockResolvedValue(null);

      // When
      const result = await memoWriteService.updateMemo(
        "non-existent-id",
        "제목",
        "내용"
      );

      // Then
      expect(result).toBeNull();
      expect(mockMemoRepository.update).not.toHaveBeenCalled();
    });

    it("ID가 제공되지 않으면 에러를 발생시켜야 함", async () => {
      // When & Then
      await expect(
        memoWriteService.updateMemo(null, "제목", "내용")
      ).rejects.toThrow(
        "메모 수정 중 오류가 발생했습니다: 메모 ID가 필요합니다."
      );

      await expect(
        memoWriteService.updateMemo("", "제목", "내용")
      ).rejects.toThrow(
        "메모 수정 중 오류가 발생했습니다: 메모 ID가 필요합니다."
      );
    });

    it("Repository 에러 시 적절한 에러 메시지를 반환해야 함", async () => {
      // Given
      const repositoryError = new Error("Database connection failed");
      mockMemoRepository.findById.mockRejectedValue(repositoryError);

      // When & Then
      await expect(
        memoWriteService.updateMemo("test-id", "제목", "내용")
      ).rejects.toThrow(
        "메모 수정 중 오류가 발생했습니다: Database connection failed"
      );
    });
  });

  describe("deleteMemo", () => {
    it("메모를 성공적으로 삭제해야 함 (24시간 이내)", async () => {
      // Given
      const memoId = "test-memo-id";
      const recentTime = Date.now() - 23 * 60 * 60 * 1000; // 23시간 전
      const existingMemo = createTestMemo({ id: memoId, regdate: recentTime });

      mockMemoRepository.findById.mockResolvedValue(existingMemo);
      mockMemoRepository.delete.mockResolvedValue(true);

      // When
      const result = await memoWriteService.deleteMemo(memoId);

      // Then
      expect(result).toBe(true);
      expect(mockMemoRepository.findById).toHaveBeenCalledWith(memoId);
      expect(mockMemoRepository.delete).toHaveBeenCalledWith(memoId);
    });

    it("만료된 메모를 성공적으로 삭제해야 함 (30일 초과)", async () => {
      // Given
      const memoId = "test-memo-id";
      const expiredTime = Date.now() - 31 * 24 * 60 * 60 * 1000; // 31일 전 (만료됨)
      const existingMemo = createTestMemo({ id: memoId, regdate: expiredTime });

      mockMemoRepository.findById.mockResolvedValue(existingMemo);
      mockMemoRepository.delete.mockResolvedValue(true);

      // When
      const result = await memoWriteService.deleteMemo(memoId);

      // Then
      expect(result).toBe(true);
      expect(mockMemoRepository.delete).toHaveBeenCalledWith(memoId);
    });

    it("24시간이 지났지만 만료되지 않은 메모 삭제 시 에러를 발생시켜야 함", async () => {
      // Given
      const memoId = "test-memo-id";
      const oldTime = Date.now() - 25 * 60 * 60 * 1000; // 25시간 전 (수정 불가하지만 만료되지 않음)
      const existingMemo = createTestMemo({ id: memoId, regdate: oldTime });

      mockMemoRepository.findById.mockResolvedValue(existingMemo);

      // When & Then
      // 24시간이 지나서 수정은 불가하지만 30일이 지나지 않아서 만료되지 않은 메모는 삭제 불가
      await expect(memoWriteService.deleteMemo(memoId)).rejects.toThrow(
        "생성 후 24시간이 지난 메모는 삭제할 수 없습니다."
      );
    });

    it("존재하지 않는 메모에 대해 false를 반환해야 함", async () => {
      // Given
      mockMemoRepository.findById.mockResolvedValue(null);

      // When
      const result = await memoWriteService.deleteMemo("non-existent-id");

      // Then
      expect(result).toBe(false);
      expect(mockMemoRepository.delete).not.toHaveBeenCalled();
    });

    it("ID가 제공되지 않으면 에러를 발생시켜야 함", async () => {
      // When & Then
      await expect(memoWriteService.deleteMemo(null)).rejects.toThrow(
        "메모 삭제 중 오류가 발생했습니다: 메모 ID가 필요합니다."
      );

      await expect(memoWriteService.deleteMemo("")).rejects.toThrow(
        "메모 삭제 중 오류가 발생했습니다: 메모 ID가 필요합니다."
      );
    });

    it("Repository 에러 시 적절한 에러 메시지를 반환해야 함", async () => {
      // Given
      const repositoryError = new Error("Database connection failed");
      mockMemoRepository.findById.mockRejectedValue(repositoryError);

      // When & Then
      await expect(memoWriteService.deleteMemo("test-id")).rejects.toThrow(
        "메모 삭제 중 오류가 발생했습니다: Database connection failed"
      );
    });
  });
});
