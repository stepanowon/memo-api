const request = require("supertest");
const { createTestApp } = require("../helpers/testHelpers");
const { createMockContainer } = require("../mocks/mockContainer");

describe("Health Routes", () => {
  let app;
  let container;

  beforeEach(() => {
    container = createMockContainer();
    app = createTestApp(container);
  });

  describe("GET /health", () => {
    it("헬스체크 엔드포인트가 정상적으로 응답해야 함", async () => {
      // When
      const response = await request(app).get("/health").expect(200);

      // Then
      expect(response.body).toHaveProperty("status", "OK");
      expect(response.body).toHaveProperty("timestamp");
      expect(response.body).toHaveProperty("uptime");

      // 타임스탬프가 ISO 형식인지 확인
      expect(() => new Date(response.body.timestamp)).not.toThrow();

      // 업타임이 숫자인지 확인
      expect(typeof response.body.uptime).toBe("number");
      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
    });

    it("헬스체크 응답의 타임스탬프가 현재 시간과 근사해야 함", async () => {
      // Given
      const beforeRequest = new Date().toISOString();

      // When
      const response = await request(app).get("/health").expect(200);

      // Then
      const afterRequest = new Date().toISOString();
      const responseTimestamp = response.body.timestamp;

      expect(responseTimestamp >= beforeRequest).toBe(true);
      expect(responseTimestamp <= afterRequest).toBe(true);
    });
  });
});
