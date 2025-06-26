const request = require("supertest");
const {
  createTestApp,
  createTestMemo,
  createTestMemos,
  validateMemoResponse,
  validateApiResponse,
  validateErrorResponse,
} = require("../helpers/testHelpers");
const {
  createMockContainer,
  resetMockServices,
  setupSuccessfulMocks,
  setupErrorMocks,
} = require("../mocks/mockContainer");

describe("Memo Routes", () => {
  let app;
  let container;

  beforeEach(() => {
    container = createMockContainer();
    app = createTestApp(container);
    resetMockServices(container);
  });

  describe("GET /memos", () => {
    it("모든 메모를 성공적으로 조회해야 함", async () => {
      // Given
      const testMemos = createTestMemos(3);
      setupSuccessfulMocks(container, { memos: testMemos });

      // When
      const response = await request(app).get("/memos").expect(200);

      // Then
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(3);
      response.body.forEach((memo) => validateMemoResponse(memo));

      // 서비스 호출 검증
      expect(
        container.services.memoValidationService.validatePagination
      ).toHaveBeenCalledWith(undefined, undefined);
      expect(
        container.services.memoReadService.getAllMemos
      ).toHaveBeenCalledWith(1, 10);
    });

    it("페이징 파라미터와 함께 메모를 조회해야 함", async () => {
      // Given
      const testMemos = createTestMemos(2);
      container.services.memoValidationService.validatePagination.mockReturnValue(
        {
          isValid: true,
          errors: [],
          page: 2,
          pageSize: 5,
        }
      );
      container.services.memoReadService.getAllMemos.mockResolvedValue(
        testMemos
      );

      // When
      const response = await request(app)
        .get("/memos?page=2&pageSize=5")
        .expect(200);

      // Then
      expect(Array.isArray(response.body)).toBe(true);
      expect(
        container.services.memoValidationService.validatePagination
      ).toHaveBeenCalledWith("2", "5");
      expect(
        container.services.memoReadService.getAllMemos
      ).toHaveBeenCalledWith(2, 5);
    });

    it("잘못된 페이징 파라미터에 대해 400 에러를 반환해야 함", async () => {
      // Given
      setupErrorMocks(container, "validation");

      // When
      const response = await request(app)
        .get("/memos?page=0&pageSize=101")
        .expect(400);

      // Then
      validateErrorResponse(response.body);
      expect(response.body.message).toBe("잘못된 페이징 파라미터입니다.");
    });

    it("서버 에러 시 500 에러를 반환해야 함", async () => {
      // Given
      setupErrorMocks(container, "serverError");

      // When
      const response = await request(app).get("/memos").expect(500);

      // Then
      validateErrorResponse(response.body);
      expect(response.body.message).toBe(
        "메모 목록 조회 중 오류가 발생했습니다."
      );
    });
  });

  describe("POST /memos", () => {
    it("새로운 메모를 성공적으로 생성해야 함", async () => {
      // Given
      const newMemo = createTestMemo();
      setupSuccessfulMocks(container, { memo: newMemo });

      // When
      const response = await request(app)
        .post("/memos")
        .send({
          title: newMemo.title,
          content: newMemo.content,
        })
        .expect(201);

      // Then
      validateApiResponse(response.body, true);
      expect(response.body.isSuccess).toBe(true);
      expect(response.body.message).toBe("메모가 성공적으로 등록되었습니다.");

      // 서비스 호출 검증
      expect(
        container.services.memoValidationService.validateCreateMemo
      ).toHaveBeenCalledWith(newMemo.title, newMemo.content);
      expect(
        container.services.memoWriteService.createMemo
      ).toHaveBeenCalledWith(newMemo.title, newMemo.content);
    });

    it("유효하지 않은 데이터에 대해 400 에러를 반환해야 함", async () => {
      // Given
      setupErrorMocks(container, "validation");

      // When
      const response = await request(app)
        .post("/memos")
        .send({
          title: "",
          content: "",
        })
        .expect(400);

      // Then
      validateErrorResponse(response.body);
      expect(response.body.message).toBe("입력 데이터가 유효하지 않습니다.");
    });

    it("서버 에러 시 500 에러를 반환해야 함", async () => {
      // Given
      container.services.memoValidationService.validateCreateMemo.mockReturnValue(
        { isValid: true, errors: [] }
      );
      setupErrorMocks(container, "serverError");

      // When
      const response = await request(app)
        .post("/memos")
        .send({
          title: "테스트 제목",
          content: "테스트 내용",
        })
        .expect(500);

      // Then
      validateErrorResponse(response.body);
      expect(response.body.message).toBe("메모 생성 중 오류가 발생했습니다.");
    });
  });

  describe("GET /memos/:id", () => {
    it("ID로 메모를 성공적으로 조회해야 함", async () => {
      // Given
      const testMemo = createTestMemo();
      setupSuccessfulMocks(container, { memo: testMemo });

      // When
      const response = await request(app)
        .get(`/memos/${testMemo.id}`)
        .expect(200);

      // Then
      validateMemoResponse(response.body);
      expect(response.body.id).toBe(testMemo.id);

      // 서비스 호출 검증
      expect(
        container.services.memoReadService.getMemoById
      ).toHaveBeenCalledWith(testMemo.id);
    });

    it("존재하지 않는 메모 ID에 대해 404 에러를 반환해야 함", async () => {
      // Given
      setupErrorMocks(container, "notFound");

      // When
      const response = await request(app)
        .get("/memos/non-existent-id")
        .expect(404);

      // Then
      expect(response.body.isSuccess).toBe(false);
      expect(response.body.message).toBe("조회할 메모가 없습니다.");
    });

    it("서버 에러 시 500 에러를 반환해야 함", async () => {
      // Given
      setupErrorMocks(container, "serverError");

      // When
      const response = await request(app).get("/memos/test-id").expect(500);

      // Then
      validateErrorResponse(response.body);
      expect(response.body.message).toBe("메모 조회 중 오류가 발생했습니다.");
    });
  });

  describe("PUT /memos/:id", () => {
    it("메모를 성공적으로 수정해야 함", async () => {
      // Given
      const updatedMemo = createTestMemo({
        title: "수정된 제목",
        content: "수정된 내용",
      });
      setupSuccessfulMocks(container, { memo: updatedMemo });

      // When
      const response = await request(app)
        .put(`/memos/${updatedMemo.id}`)
        .send({
          title: updatedMemo.title,
          content: updatedMemo.content,
        })
        .expect(200);

      // Then
      validateApiResponse(response.body, true);
      expect(response.body.isSuccess).toBe(true);
      expect(response.body.message).toBe("메모가 성공적으로 수정되었습니다.");

      // 서비스 호출 검증
      expect(
        container.services.memoValidationService.validateUpdateMemo
      ).toHaveBeenCalledWith(updatedMemo.title, updatedMemo.content);
      expect(
        container.services.memoWriteService.updateMemo
      ).toHaveBeenCalledWith(
        updatedMemo.id,
        updatedMemo.title,
        updatedMemo.content
      );
    });

    it("부분 업데이트를 성공적으로 수행해야 함 (제목만 수정)", async () => {
      // Given
      const updatedMemo = createTestMemo({ title: "새로운 제목" });
      setupSuccessfulMocks(container, { memo: updatedMemo });

      // When
      const response = await request(app)
        .put(`/memos/${updatedMemo.id}`)
        .send({
          title: updatedMemo.title,
        })
        .expect(200);

      // Then
      validateApiResponse(response.body, true);
      expect(
        container.services.memoValidationService.validateUpdateMemo
      ).toHaveBeenCalledWith(updatedMemo.title, undefined);
    });

    it("유효하지 않은 데이터에 대해 400 에러를 반환해야 함", async () => {
      // Given
      setupErrorMocks(container, "validation");

      // When
      const response = await request(app)
        .put("/memos/test-id")
        .send({
          title: "",
          content: "",
        })
        .expect(400);

      // Then
      validateErrorResponse(response.body);
      expect(response.body.message).toBe("입력 데이터가 유효하지 않습니다.");
    });

    it("존재하지 않는 메모 ID에 대해 404 에러를 반환해야 함", async () => {
      // Given
      container.services.memoValidationService.validateUpdateMemo.mockReturnValue(
        { isValid: true, errors: [] }
      );
      setupErrorMocks(container, "notFound");

      // When
      const response = await request(app)
        .put("/memos/non-existent-id")
        .send({
          title: "수정된 제목",
          content: "수정된 내용",
        })
        .expect(404);

      // Then
      expect(response.body.isSuccess).toBe(false);
      expect(response.body.message).toBe("수정할 메모가 없습니다.");
    });

    it("서버 에러 시 500 에러를 반환해야 함", async () => {
      // Given
      container.services.memoValidationService.validateUpdateMemo.mockReturnValue(
        { isValid: true, errors: [] }
      );
      setupErrorMocks(container, "serverError");

      // When
      const response = await request(app)
        .put("/memos/test-id")
        .send({
          title: "수정된 제목",
          content: "수정된 내용",
        })
        .expect(500);

      // Then
      validateErrorResponse(response.body);
      expect(response.body.message).toBe("메모 수정 중 오류가 발생했습니다.");
    });
  });

  describe("DELETE /memos/:id", () => {
    it("메모를 성공적으로 삭제해야 함", async () => {
      // Given
      const testMemo = createTestMemo();
      container.services.memoReadService.getMemoById.mockResolvedValue(
        testMemo
      );
      container.services.memoWriteService.deleteMemo.mockResolvedValue(true);

      // When
      const response = await request(app)
        .delete(`/memos/${testMemo.id}`)
        .expect(200);

      // Then
      expect(response.body.isSuccess).toBe(true);
      expect(response.body.message).toBe("메모가 성공적으로 삭제되었습니다.");

      // 서비스 호출 검증
      expect(
        container.services.memoReadService.getMemoById
      ).toHaveBeenCalledWith(testMemo.id);
      expect(
        container.services.memoWriteService.deleteMemo
      ).toHaveBeenCalledWith(testMemo.id);
    });

    it("존재하지 않는 메모 ID에 대해 404 에러를 반환해야 함", async () => {
      // Given
      container.services.memoReadService.getMemoById.mockResolvedValue(null);

      // When
      const response = await request(app)
        .delete("/memos/non-existent-id")
        .expect(404);

      // Then
      expect(response.body.isSuccess).toBe(false);
      expect(response.body.message).toBe("삭제할 메모가 없습니다.");
    });

    it("서버 에러 시 500 에러를 반환해야 함", async () => {
      // Given
      setupErrorMocks(container, "serverError");

      // When
      const response = await request(app).delete("/memos/test-id").expect(500);

      // Then
      validateErrorResponse(response.body);
      expect(response.body.message).toBe("메모 삭제 중 오류가 발생했습니다.");
    });
  });
});
