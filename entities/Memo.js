const { v4: uuidv4 } = require("uuid");

// 도메인 엔터티 - 핵심 비즈니스 규칙
const createMemo = (title, content, id = null, regdate = null) => {
  // 도메인 비즈니스 규칙 검증
  if (!title || typeof title !== "string") {
    throw new Error("제목은 필수 입력 항목입니다.");
  }

  if (!content || typeof content !== "string") {
    throw new Error("내용은 필수 입력 항목입니다.");
  }

  if (title.length > 200) {
    throw new Error("제목은 200자를 초과할 수 없습니다.");
  }

  if (content.length > 5000) {
    throw new Error("내용은 5000자를 초과할 수 없습니다.");
  }

  const memoId = id || uuidv4();
  const createdDate = regdate || Date.now();
  const trimmedTitle = title.trim();
  const trimmedContent = content.trim();

  // 도메인 메서드들
  const isExpired = () => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return createdDate < thirtyDaysAgo;
  };

  const canBeModified = () => {
    // 비즈니스 규칙: 생성 후 24시간 이내만 수정 가능
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
    return createdDate > twentyFourHoursAgo;
  };

  const getWordCount = () => {
    return trimmedContent.split(/\s+/).length;
  };

  const isTitleValid = () => {
    return trimmedTitle.length > 0 && trimmedTitle.length <= 200;
  };

  const isContentValid = () => {
    return trimmedContent.length > 0 && trimmedContent.length <= 5000;
  };

  const toPlainObject = () => ({
    id: memoId,
    title: trimmedTitle,
    content: trimmedContent,
    regdate: createdDate,
  });

  const updateContent = (newTitle, newContent) => {
    if (!canBeModified()) {
      throw new Error("생성 후 24시간이 지난 메모는 수정할 수 없습니다.");
    }

    return createMemo(
      newTitle || trimmedTitle,
      newContent || trimmedContent,
      memoId,
      createdDate
    );
  };

  return {
    // 데이터 접근자
    getId: () => memoId,
    getTitle: () => trimmedTitle,
    getContent: () => trimmedContent,
    getRegdate: () => createdDate,

    // 도메인 메서드
    isExpired,
    canBeModified,
    getWordCount,
    isTitleValid,
    isContentValid,
    updateContent,
    toPlainObject,
  };
};

// 팩토리 함수들
const createMemoFromData = (data) => {
  return createMemo(data.title, data.content, data.id, data.regdate);
};

const createNewMemo = (title, content) => {
  return createMemo(title, content);
};

module.exports = {
  createMemo,
  createMemoFromData,
  createNewMemo,
};
