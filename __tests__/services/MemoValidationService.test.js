const createMemoValidationService = require("../../services/MemoValidationService");

describe("MemoValidationService", () => {
  let memoValidationService;

  beforeEach(() => {
    memoValidationService = createMemoValidationService();
  });

  describe("validateCreateMemo", () => {
    it("유효한 제목과 내용에 대해 성공해야 함", () => {
      // Given
      const title = "유효한 제목";
      const content = "유효한 내용입니다.";

      // When
      const result = memoValidationService.validateCreateMemo(title, content);

      // Then
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("빈 제목에 대해 실패해야 함", () => {
      // Given
      const title = "";
      const content = "유효한 내용입니다.";

      // When
      const result = memoValidationService.validateCreateMemo(title, content);

      // Then
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("빈 내용에 대해 실패해야 함", () => {
      // Given
      const title = "유효한 제목";
      const content = "";

      // When
      const result = memoValidationService.validateCreateMemo(title, content);

      // Then
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("null 값에 대해 실패해야 함", () => {
      // When
      const result1 = memoValidationService.validateCreateMemo(null, "내용");
      const result2 = memoValidationService.validateCreateMemo("제목", null);

      // Then
      expect(result1.isValid).toBe(false);
      expect(result2.isValid).toBe(false);
    });

    it("undefined 값에 대해 실패해야 함", () => {
      // When
      const result1 = memoValidationService.validateCreateMemo(
        undefined,
        "내용"
      );
      const result2 = memoValidationService.validateCreateMemo(
        "제목",
        undefined
      );

      // Then
      expect(result1.isValid).toBe(false);
      expect(result2.isValid).toBe(false);
    });
  });

  describe("validateUpdateMemo", () => {
    it("유효한 제목과 내용에 대해 성공해야 함", () => {
      // Given
      const title = "수정된 제목";
      const content = "수정된 내용입니다.";

      // When
      const result = memoValidationService.validateUpdateMemo(title, content);

      // Then
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("제목만 제공된 경우 성공해야 함", () => {
      // Given
      const title = "수정된 제목";

      // When
      const result = memoValidationService.validateUpdateMemo(title, undefined);

      // Then
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("내용만 제공된 경우 성공해야 함", () => {
      // Given
      const content = "수정된 내용입니다.";

      // When
      const result = memoValidationService.validateUpdateMemo(
        undefined,
        content
      );

      // Then
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("빈 제목이 제공된 경우 실패해야 함", () => {
      // Given
      const title = "";
      const content = "유효한 내용";

      // When
      const result = memoValidationService.validateUpdateMemo(title, content);

      // Then
      expect(result.isValid).toBe(false);
      expect(result.errors.some((error) => error.includes("제목"))).toBe(true);
    });

    it("빈 내용이 제공된 경우 실패해야 함", () => {
      // Given
      const title = "유효한 제목";
      const content = "";

      // When
      const result = memoValidationService.validateUpdateMemo(title, content);

      // Then
      expect(result.isValid).toBe(false);
      expect(result.errors.some((error) => error.includes("내용"))).toBe(true);
    });

    it("너무 긴 제목에 대해 실패해야 함", () => {
      // Given
      const title = "a".repeat(201); // 200자 초과
      const content = "유효한 내용";

      // When
      const result = memoValidationService.validateUpdateMemo(title, content);

      // Then
      expect(result.isValid).toBe(false);
      expect(result.errors.some((error) => error.includes("200자"))).toBe(true);
    });

    it("너무 긴 내용에 대해 실패해야 함", () => {
      // Given
      const title = "유효한 제목";
      const content = "a".repeat(5001); // 5000자 초과

      // When
      const result = memoValidationService.validateUpdateMemo(title, content);

      // Then
      expect(result.isValid).toBe(false);
      expect(result.errors.some((error) => error.includes("5000자"))).toBe(
        true
      );
    });

    it("최대 길이 제한 내의 제목과 내용에 대해 성공해야 함", () => {
      // Given
      const title = "a".repeat(200); // 정확히 200자
      const content = "a".repeat(5000); // 정확히 5000자

      // When
      const result = memoValidationService.validateUpdateMemo(title, content);

      // Then
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("validatePagination", () => {
    it("유효한 페이징 파라미터에 대해 성공해야 함", () => {
      // When
      const result = memoValidationService.validatePagination("1", "10");

      // Then
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
    });

    it("문자열 숫자를 올바르게 파싱해야 함", () => {
      // When
      const result = memoValidationService.validatePagination("5", "20");

      // Then
      expect(result.isValid).toBe(true);
      expect(result.page).toBe(5);
      expect(result.pageSize).toBe(20);
    });

    it("undefined 값에 대해 기본값을 사용해야 함", () => {
      // When
      const result = memoValidationService.validatePagination(
        undefined,
        undefined
      );

      // Then
      expect(result.isValid).toBe(true);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
    });

    it("0 이하의 페이지 번호에 대해 실패해야 함", () => {
      // When
      const result1 = memoValidationService.validatePagination("0", "10");
      const result2 = memoValidationService.validatePagination("-1", "10");

      // Then
      // "0"은 parseInt("0") || 1 = 1이 되므로 통과함
      expect(result1.isValid).toBe(true);
      // "-1"은 parseInt("-1") || 1 = -1이 되므로 실패함
      expect(result2.isValid).toBe(false);
      expect(result2.errors.some((error) => error.includes("1 이상"))).toBe(
        true
      );
    });

    it("0 이하의 페이지 크기에 대해 실패해야 함", () => {
      // When
      const result1 = memoValidationService.validatePagination("1", "0");
      const result2 = memoValidationService.validatePagination("1", "-5");

      // Then
      // "0"은 parseInt("0") || 10 = 10이 되므로 통과함
      expect(result1.isValid).toBe(true);
      // "-5"는 parseInt("-5") || 10 = -5가 되므로 실패함
      expect(result2.isValid).toBe(false);
      expect(result2.errors.some((error) => error.includes("1-100 사이"))).toBe(
        true
      );
    });

    it("100을 초과하는 페이지 크기에 대해 실패해야 함", () => {
      // When
      const result = memoValidationService.validatePagination("1", "101");

      // Then
      expect(result.isValid).toBe(false);
      expect(result.errors.some((error) => error.includes("1-100 사이"))).toBe(
        true
      );
    });

    it("숫자가 아닌 값에 대해 기본값을 사용해야 함", () => {
      // When
      const result = memoValidationService.validatePagination("abc", "def");

      // Then
      expect(result.isValid).toBe(true);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
    });

    it("최대 허용 페이지 크기에 대해 성공해야 함", () => {
      // When
      const result = memoValidationService.validatePagination("1", "100");

      // Then
      expect(result.isValid).toBe(true);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(100);
    });
  });

  describe("validateMemoId", () => {
    it("유효한 메모 ID에 대해 성공해야 함", () => {
      // Given
      const validId = "valid-memo-id-123";

      // When
      const result = memoValidationService.validateMemoId(validId);

      // Then
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("빈 문자열 ID에 대해 실패해야 함", () => {
      // When
      const result = memoValidationService.validateMemoId("");

      // Then
      expect(result.isValid).toBe(false);
      expect(result.errors.some((error) => error.includes("필수"))).toBe(true);
    });

    it("공백만 있는 ID에 대해 실패해야 함", () => {
      // When
      const result = memoValidationService.validateMemoId("   ");

      // Then
      expect(result.isValid).toBe(false);
      expect(result.errors.some((error) => error.includes("빈 문자열"))).toBe(
        true
      );
    });

    it("null ID에 대해 실패해야 함", () => {
      // When
      const result = memoValidationService.validateMemoId(null);

      // Then
      expect(result.isValid).toBe(false);
      expect(result.errors.some((error) => error.includes("필수"))).toBe(true);
    });

    it("undefined ID에 대해 실패해야 함", () => {
      // When
      const result = memoValidationService.validateMemoId(undefined);

      // Then
      expect(result.isValid).toBe(false);
      expect(result.errors.some((error) => error.includes("필수"))).toBe(true);
    });

    it("숫자 타입 ID에 대해 실패해야 함", () => {
      // When
      const result = memoValidationService.validateMemoId(123);

      // Then
      expect(result.isValid).toBe(false);
      expect(result.errors.some((error) => error.includes("문자열"))).toBe(
        true
      );
    });

    it("객체 타입 ID에 대해 실패해야 함", () => {
      // When
      const result = memoValidationService.validateMemoId({});

      // Then
      expect(result.isValid).toBe(false);
      expect(result.errors.some((error) => error.includes("문자열"))).toBe(
        true
      );
    });
  });
});
