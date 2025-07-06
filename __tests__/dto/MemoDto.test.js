const {
  createMemoRequestDto,
  updateMemoRequestDto,
  paginationRequestDto,
  memoResponseDto,
  successResponseDto,
  errorResponseDto,
  paginatedResponseDto,
} = require("../../dto/MemoDto");
const { createTestMemo, createTestMemos } = require("../helpers/testHelpers");

describe("MemoDto", () => {
  describe("Request DTOs", () => {
    describe("createMemoRequestDto", () => {
      it("정상적인 제목과 내용으로 DTO를 생성해야 함", () => {
        // Given
        const title = "테스트 제목";
        const content = "테스트 내용";

        // When
        const result = createMemoRequestDto(title, content);

        // Then
        expect(result).toEqual({
          title: "테스트 제목",
          content: "테스트 내용",
        });
      });

      it("제목과 내용을 문자열로 변환하고 trim 처리해야 함", () => {
        // Given
        const title = "  공백이 있는 제목  ";
        const content = "  공백이 있는 내용  ";

        // When
        const result = createMemoRequestDto(title, content);

        // Then
        expect(result.title).toBe("공백이 있는 제목");
        expect(result.content).toBe("공백이 있는 내용");
      });

      it("null이나 undefined 값을 빈 문자열로 처리해야 함", () => {
        // When
        const result1 = createMemoRequestDto(null, null);
        const result2 = createMemoRequestDto(undefined, undefined);

        // Then
        expect(result1.title).toBe("");
        expect(result1.content).toBe("");
        expect(result2.title).toBe("");
        expect(result2.content).toBe("");
      });

      it("숫자나 다른 타입을 문자열로 변환해야 함", () => {
        // When
        const result = createMemoRequestDto(123, 456);

        // Then
        expect(result.title).toBe("123");
        expect(result.content).toBe("456");
      });
    });

    describe("updateMemoRequestDto", () => {
      it("정상적인 제목과 내용으로 DTO를 생성해야 함", () => {
        // Given
        const title = "수정된 제목";
        const content = "수정된 내용";

        // When
        const result = updateMemoRequestDto(title, content);

        // Then
        expect(result).toEqual({
          title: "수정된 제목",
          content: "수정된 내용",
        });
      });

      it("제목과 내용을 문자열로 변환하고 trim 처리해야 함", () => {
        // Given
        const title = "  수정된 제목  ";
        const content = "  수정된 내용  ";

        // When
        const result = updateMemoRequestDto(title, content);

        // Then
        expect(result.title).toBe("수정된 제목");
        expect(result.content).toBe("수정된 내용");
      });

      it("null 값을 빈 문자열로 처리해야 함", () => {
        // When
        const result = updateMemoRequestDto(null, null);

        // Then
        expect(result.title).toBe("");
        expect(result.content).toBe("");
      });

      it("undefined 값은 결과에 포함되지 않아야 함", () => {
        // When
        const result = updateMemoRequestDto(undefined, undefined);

        // Then
        expect(result.title).toBeUndefined();
        expect(result.content).toBeUndefined();
      });
    });

    describe("paginationRequestDto", () => {
      it("정상적인 페이지와 페이지 크기로 DTO를 생성해야 함", () => {
        // When
        const result = paginationRequestDto(2, 20);

        // Then
        expect(result).toEqual({
          page: 2,
          pageSize: 20,
        });
      });

      it("문자열 숫자를 정수로 변환해야 함", () => {
        // When
        const result = paginationRequestDto("3", "15");

        // Then
        expect(result.page).toBe(3);
        expect(result.pageSize).toBe(15);
      });

      it("잘못된 값에 대해 기본값을 사용해야 함", () => {
        // When
        const result1 = paginationRequestDto(null, null);
        const result2 = paginationRequestDto(undefined, undefined);
        const result3 = paginationRequestDto("invalid", "invalid");

        // Then
        expect(result1.page).toBe(1);
        expect(result1.pageSize).toBe(10);
        expect(result2.page).toBe(1);
        expect(result2.pageSize).toBe(10);
        expect(result3.page).toBe(1);
        expect(result3.pageSize).toBe(10);
      });

      it("0 이하의 값에 대해 기본값을 사용해야 함", () => {
        // When
        const result = paginationRequestDto(0, -5);

        // Then
        expect(result.page).toBe(1);
        expect(result.pageSize).toBe(10);
      });
    });
  });

  describe("Response DTOs", () => {
    describe("memoResponseDto", () => {
      it("정상적인 메모 객체를 DTO로 변환해야 함", () => {
        // Given
        const memo = createTestMemo();

        // When
        const result = memoResponseDto(memo);

        // Then
        expect(result).toEqual({
          id: memo.id,
          title: memo.title,
          content: memo.content,
          regdate: memo.regdate,
        });
      });

      it("메모 엔터티의 메서드를 통해 값을 가져와야 함", () => {
        // Given
        const memoEntity = {
          getId: () => "test-id",
          getTitle: () => "test-title",
          getContent: () => "test-content",
          getRegdate: () => 1234567890,
        };

        // When
        const result = memoResponseDto(memoEntity);

        // Then
        expect(result).toEqual({
          id: "test-id",
          title: "test-title",
          content: "test-content",
          regdate: 1234567890,
        });
      });

      it("null이나 undefined 메모에 대해 null을 반환해야 함", () => {
        // When
        const result1 = memoResponseDto(null);
        const result2 = memoResponseDto(undefined);

        // Then
        expect(result1).toBeNull();
        expect(result2).toBeNull();
      });

      it("일반 객체와 엔터티 객체를 모두 처리해야 함", () => {
        // Given
        const plainObject = {
          id: "plain-id",
          title: "plain-title",
          content: "plain-content",
          regdate: 9876543210,
        };

        // When
        const result = memoResponseDto(plainObject);

        // Then
        expect(result).toEqual({
          id: "plain-id",
          title: "plain-title",
          content: "plain-content",
          regdate: 9876543210,
        });
      });
    });

    describe("successResponseDto", () => {
      it("성공 응답 DTO를 생성해야 함", () => {
        // Given
        const message = "성공적으로 처리되었습니다";
        const data = { id: "test-id" };

        // When
        const result = successResponseDto(message, data);

        // Then
        expect(result).toEqual({
          isSuccess: true,
          message: "성공적으로 처리되었습니다",
          item: { id: "test-id" },
        });
      });

      it("데이터 없이 성공 응답 DTO를 생성해야 함", () => {
        // Given
        const message = "성공적으로 처리되었습니다";

        // When
        const result = successResponseDto(message);

        // Then
        expect(result).toEqual({
          isSuccess: true,
          message: "성공적으로 처리되었습니다",
          item: undefined,
        });
      });
    });

    describe("errorResponseDto", () => {
      it("에러 응답 DTO를 생성해야 함", () => {
        // Given
        const message = "오류가 발생했습니다";
        const errors = ["첫 번째 오류", "두 번째 오류"];

        // When
        const result = errorResponseDto(message, errors);

        // Then
        expect(result).toEqual({
          isSuccess: false,
          message: "오류가 발생했습니다",
          errors: ["첫 번째 오류", "두 번째 오류"],
        });
      });

      it("에러 배열 없이 에러 응답 DTO를 생성해야 함", () => {
        // Given
        const message = "오류가 발생했습니다";

        // When
        const result = errorResponseDto(message);

        // Then
        expect(result).toEqual({
          isSuccess: false,
          message: "오류가 발생했습니다",
          errors: [],
        });
      });

      it("단일 에러 문자열을 배열로 변환해야 함", () => {
        // Given
        const message = "오류가 발생했습니다";
        const error = "단일 오류";

        // When
        const result = errorResponseDto(message, error);

        // Then
        expect(result).toEqual({
          isSuccess: false,
          message: "오류가 발생했습니다",
          errors: ["단일 오류"],
        });
      });
    });

    describe("paginatedResponseDto", () => {
      it("페이지네이션 응답 DTO를 생성해야 함", () => {
        // Given
        const items = createTestMemos(3);
        const page = 2;
        const pageSize = 10;
        const totalCount = 25;

        // When
        const result = paginatedResponseDto(items, page, pageSize, totalCount);

        // Then
        expect(result).toEqual({
          isSuccess: true,
          items: items,
          pagination: {
            page: 2,
            pageSize: 10,
            totalCount: 25,
            totalPages: 3,
            hasNext: true,
            hasPrevious: true,
          },
        });
      });

      it("첫 번째 페이지에 대해 올바른 pagination 정보를 생성해야 함", () => {
        // Given
        const items = createTestMemos(5);
        const page = 1;
        const pageSize = 10;
        const totalCount = 15;

        // When
        const result = paginatedResponseDto(items, page, pageSize, totalCount);

        // Then
        expect(result.pagination).toEqual({
          page: 1,
          pageSize: 10,
          totalCount: 15,
          totalPages: 2,
          hasNext: true,
          hasPrevious: false,
        });
      });

      it("마지막 페이지에 대해 올바른 pagination 정보를 생성해야 함", () => {
        // Given
        const items = createTestMemos(5);
        const page = 3;
        const pageSize = 10;
        const totalCount = 25;

        // When
        const result = paginatedResponseDto(items, page, pageSize, totalCount);

        // Then
        expect(result.pagination).toEqual({
          page: 3,
          pageSize: 10,
          totalCount: 25,
          totalPages: 3,
          hasNext: false,
          hasPrevious: true,
        });
      });

      it("단일 페이지에 대해 올바른 pagination 정보를 생성해야 함", () => {
        // Given
        const items = createTestMemos(5);
        const page = 1;
        const pageSize = 10;
        const totalCount = 5;

        // When
        const result = paginatedResponseDto(items, page, pageSize, totalCount);

        // Then
        expect(result.pagination).toEqual({
          page: 1,
          pageSize: 10,
          totalCount: 5,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        });
      });
    });
  });
});
