const express = require("express");
const createMemoRoutes = require("../../routes/memoRoutes");

// 테스트용 Express 앱 생성
const createTestApp = (container) => {
  const app = express();
  app.use(express.json());

  const memoRoutes = createMemoRoutes(container);
  app.use("/memos", memoRoutes);

  return app;
};

// 테스트용 메모 데이터 생성
const createTestMemo = (overrides = {}) => {
  const defaultMemo = {
    id: "test-memo-id",
    title: "테스트 메모",
    content: "테스트 내용입니다.",
    regdate: Date.now(),
  };

  return { ...defaultMemo, ...overrides };
};

// 테스트용 메모 배열 생성
const createTestMemos = (count = 3) => {
  return Array.from({ length: count }, (_, index) =>
    createTestMemo({
      id: `test-memo-${index + 1}`,
      title: `테스트 메모 ${index + 1}`,
      content: `테스트 내용 ${index + 1}입니다.`,
      regdate: Date.now() - index * 1000, // 시간 차이를 두어 정렬 테스트 가능
    })
  );
};

// UUID 형식 검증
const isValidUUID = (str) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

// 응답 구조 검증
const validateMemoResponse = (memo) => {
  expect(memo).toHaveProperty("id");
  expect(memo).toHaveProperty("title");
  expect(memo).toHaveProperty("content");
  expect(memo).toHaveProperty("regdate");
  expect(typeof memo.id).toBe("string");
  expect(typeof memo.title).toBe("string");
  expect(typeof memo.content).toBe("string");
  expect(typeof memo.regdate).toBe("number");
};

// API 응답 구조 검증
const validateApiResponse = (response, hasItem = false) => {
  expect(response).toHaveProperty("isSuccess");
  expect(response).toHaveProperty("message");
  expect(typeof response.isSuccess).toBe("boolean");
  expect(typeof response.message).toBe("string");

  if (hasItem) {
    expect(response).toHaveProperty("item");
    validateMemoResponse(response.item);
  }
};

// 에러 응답 구조 검증
const validateErrorResponse = (response) => {
  expect(response).toHaveProperty("isSuccess", false);
  expect(response).toHaveProperty("message");
  expect(response).toHaveProperty("errors");
  expect(typeof response.message).toBe("string");
  expect(Array.isArray(response.errors)).toBe(true);
};

module.exports = {
  createTestApp,
  createTestMemo,
  createTestMemos,
  isValidUUID,
  validateMemoResponse,
  validateApiResponse,
  validateErrorResponse,
};
