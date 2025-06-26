const { createMemo } = require("../entities/Memo");

const createMemoValidationService = () => {
  const validateCreateMemo = (title, content) => {
    try {
      // 도메인 엔터티의 비즈니스 규칙 검증 활용
      const memoEntity = createMemo(title, content);

      const errors = [];

      if (!memoEntity.isTitleValid()) {
        errors.push("제목이 유효하지 않습니다.");
      }

      if (!memoEntity.isContentValid()) {
        errors.push("내용이 유효하지 않습니다.");
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    } catch (error) {
      // 도메인 엔터티에서 발생한 비즈니스 규칙 위반
      return {
        isValid: false,
        errors: [error.message],
      };
    }
  };

  const validateUpdateMemo = (title, content) => {
    const errors = [];

    // 개별 필드 검증 (부분 업데이트 지원)
    if (title !== undefined) {
      try {
        if (typeof title !== "string" || title.trim().length === 0) {
          errors.push("제목이 제공된 경우 빈 문자열일 수 없습니다.");
        } else if (title.length > 200) {
          errors.push("제목은 200자를 초과할 수 없습니다.");
        }
      } catch (error) {
        errors.push(`제목 검증 오류: ${error.message}`);
      }
    }

    if (content !== undefined) {
      try {
        if (typeof content !== "string" || content.trim().length === 0) {
          errors.push("내용이 제공된 경우 빈 문자열일 수 없습니다.");
        } else if (content.length > 5000) {
          errors.push("내용은 5000자를 초과할 수 없습니다.");
        }
      } catch (error) {
        errors.push(`내용 검증 오류: ${error.message}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  const validatePagination = (page, pageSize) => {
    const errors = [];
    const parsedPage = parseInt(page) || 1;
    const parsedPageSize = parseInt(pageSize) || 10;

    if (parsedPage < 1) {
      errors.push("페이지 번호는 1 이상이어야 합니다.");
    }

    if (parsedPageSize < 1 || parsedPageSize > 100) {
      errors.push("페이지 크기는 1-100 사이여야 합니다.");
    }

    return {
      isValid: errors.length === 0,
      errors,
      page: parsedPage,
      pageSize: parsedPageSize,
    };
  };

  const validateMemoId = (id) => {
    const errors = [];

    if (!id) {
      errors.push("메모 ID는 필수입니다.");
    } else if (typeof id !== "string") {
      errors.push("메모 ID는 문자열이어야 합니다.");
    } else if (id.trim().length === 0) {
      errors.push("메모 ID는 빈 문자열일 수 없습니다.");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  return {
    validateCreateMemo,
    validateUpdateMemo,
    validatePagination,
    validateMemoId,
  };
};

module.exports = createMemoValidationService;
