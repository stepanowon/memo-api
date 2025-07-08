const request = require("supertest");
const express = require("express");
const { setupContainer } = require("../../container/containerSetup");
const createMemoRoutes = require("../../routes/memoRoutes");

describe("Memo API 통합 테스트", () => {
  let app;
  let container;
  let server;

  beforeAll(async () => {
    // 테스트용 Express 앱 설정
    app = express();

    // 의존성 주입 컨테이너 설정
    container = await setupContainer(0); // 포트 0으로 설정하여 임의 포트 사용

    // Express 미들웨어 설정
    app.use(express.json());

    // Swagger 설정
    const swaggerConfig = container.resolve("swaggerConfig");
    const swaggerMiddleware = swaggerConfig.getSwaggerMiddleware();

    // 라우트 설정
    const memoRoutes = createMemoRoutes(container);
    app.use("/memos", memoRoutes);

    // Swagger UI 설정
    app.use("/api-docs", swaggerMiddleware.serve, swaggerMiddleware.setup);

    // Swagger JSON 엔드포인트
    app.get("/swagger.json", (req, res) => {
      res.setHeader("Content-Type", "application/json");
      res.send(swaggerMiddleware.spec);
    });

    // 헬스체크 엔드포인트
    app.get("/health", (req, res) => {
      res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    // 404 핸들러
    app.use("*", (req, res) => {
      res.status(404).json({
        isSuccess: false,
        message: "요청한 리소스를 찾을 수 없습니다.",
      });
    });

    // 전역 에러 핸들러
    app.use((error, req, res, next) => {
      // JSON 파싱 오류 처리
      if (error.type === 'entity.parse.failed') {
        console.error("JSON 파싱 오류:", error.message);
        return res.status(400).json({
          isSuccess: false,
          message: "잘못된 JSON 형식입니다. 요청 본문을 확인해주세요.",
          error: "Invalid JSON format"
        });
      }
      
      // 기타 서버 오류 처리
      console.error("서버 오류:", error);
      res.status(500).json({
        isSuccess: false,
        message: "서버 내부 오류가 발생했습니다.",
      });
    });
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
  });

  describe("시스템 엔드포인트", () => {
    it("헬스체크 엔드포인트가 정상 응답해야 함", async () => {
      const response = await request(app).get("/health");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status", "OK");
      expect(response.body).toHaveProperty("timestamp");
      expect(response.body).toHaveProperty("uptime");
      expect(typeof response.body.uptime).toBe("number");
    });

    it("Swagger JSON 엔드포인트가 정상 응답해야 함", async () => {
      const response = await request(app).get("/swagger.json");

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.body).toHaveProperty("openapi");
      expect(response.body).toHaveProperty("info");
      expect(response.body).toHaveProperty("paths");
    });

    it("존재하지 않는 경로에 대해 404를 반환해야 함", async () => {
      const response = await request(app).get("/nonexistent");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        isSuccess: false,
        message: "요청한 리소스를 찾을 수 없습니다.",
      });
    });
  });

  describe("메모 API 통합 테스트", () => {
    let createdMemoId;

    it("새 메모를 생성할 수 있어야 함", async () => {
      const newMemo = {
        title: "통합 테스트 메모",
        content: "이것은 통합 테스트에서 생성된 메모입니다.",
      };

      const response = await request(app).post("/memos").send(newMemo);

      expect(response.status).toBe(201);
      expect(response.body.isSuccess).toBe(true);
      expect(response.body.message).toBe("메모가 성공적으로 등록되었습니다.");
      expect(response.body.item).toHaveProperty("id");
      expect(response.body.item.title).toBe(newMemo.title);
      expect(response.body.item.content).toBe(newMemo.content);

      createdMemoId = response.body.item.id;
    });

    it("모든 메모를 조회할 수 있어야 함", async () => {
      const response = await request(app).get("/memos");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // 첫 번째 메모의 구조 확인
      if (response.body.length > 0) {
        const firstMemo = response.body[0];
        expect(firstMemo).toHaveProperty("id");
        expect(firstMemo).toHaveProperty("title");
        expect(firstMemo).toHaveProperty("content");
        expect(firstMemo).toHaveProperty("regdate");
        expect(firstMemo).toHaveProperty("wordCount");
        expect(firstMemo).toHaveProperty("canBeModified");
        expect(firstMemo).toHaveProperty("isExpired");
      }
    });

    it("특정 메모를 조회할 수 있어야 함", async () => {
      const response = await request(app).get(`/memos/${createdMemoId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(createdMemoId);
      expect(response.body.title).toBe("통합 테스트 메모");
      expect(response.body.content).toBe(
        "이것은 통합 테스트에서 생성된 메모입니다."
      );
    });

    it("메모를 수정할 수 있어야 함", async () => {
      const updateData = {
        title: "수정된 통합 테스트 메모",
        content: "이것은 수정된 통합 테스트 메모입니다.",
      };

      const response = await request(app)
        .put(`/memos/${createdMemoId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.isSuccess).toBe(true);
      expect(response.body.message).toBe("메모가 성공적으로 수정되었습니다.");
      expect(response.body.item.title).toBe(updateData.title);
      expect(response.body.item.content).toBe(updateData.content);
    });

    it("메모를 삭제할 수 있어야 함", async () => {
      const response = await request(app).delete(`/memos/${createdMemoId}`);

      expect(response.status).toBe(200);
      expect(response.body.isSuccess).toBe(true);
      expect(response.body.message).toBe("메모가 성공적으로 삭제되었습니다.");
    });

    it("삭제된 메모를 조회하면 404를 반환해야 함", async () => {
      const response = await request(app).get(`/memos/${createdMemoId}`);

      expect(response.status).toBe(404);
      expect(response.body.isSuccess).toBe(false);
      expect(response.body.message).toBe("조회할 메모가 없습니다.");
    });
  });

  describe("메모 API 검증 테스트", () => {
    it("잘못된 데이터로 메모 생성 시 400 에러를 반환해야 함", async () => {
      const invalidMemo = {
        title: "", // 빈 제목
        content: "내용",
      };

      const response = await request(app).post("/memos").send(invalidMemo);

      expect(response.status).toBe(400);
      expect(response.body.isSuccess).toBe(false);
      expect(response.body.message).toBe("입력 데이터가 유효하지 않습니다.");
    });

    it("존재하지 않는 메모 조회 시 404 에러를 반환해야 함", async () => {
      const response = await request(app).get("/memos/nonexistent-id");

      expect(response.status).toBe(404);
      expect(response.body.isSuccess).toBe(false);
      expect(response.body.message).toBe("조회할 메모가 없습니다.");
    });

    it("존재하지 않는 메모 수정 시 404 에러를 반환해야 함", async () => {
      const updateData = {
        title: "수정된 제목",
        content: "수정된 내용",
      };

      const response = await request(app)
        .put("/memos/nonexistent-id")
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body.isSuccess).toBe(false);
      expect(response.body.message).toBe("수정할 메모가 없습니다.");
    });

    it("존재하지 않는 메모 삭제 시 404 에러를 반환해야 함", async () => {
      const response = await request(app).delete("/memos/nonexistent-id");

      expect(response.status).toBe(404);
      expect(response.body.isSuccess).toBe(false);
      expect(response.body.message).toBe("삭제할 메모가 없습니다.");
    });
  });

  describe("페이지네이션 테스트", () => {
    beforeAll(async () => {
      // 테스트용 메모 여러 개 생성
      const memos = Array.from({ length: 15 }, (_, i) => ({
        title: `페이지네이션 테스트 메모 ${i + 1}`,
        content: `이것은 페이지네이션 테스트용 메모 ${i + 1}입니다.`,
      }));

      for (const memo of memos) {
        await request(app).post("/memos").send(memo);
      }
    });

    it("페이지네이션이 정상 작동해야 함", async () => {
      const response = await request(app)
        .get("/memos")
        .query({ page: 1, pageSize: 5 });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(5); // 최대 5개

      // 메모가 있다면 구조 확인
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty("id");
        expect(response.body[0]).toHaveProperty("title");
      }
    });

    it("두 번째 페이지를 조회할 수 있어야 함", async () => {
      const response = await request(app)
        .get("/memos")
        .query({ page: 2, pageSize: 5 });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(5); // 최대 5개
    });

    it("기본 정렬(regdate 역순)이 정상 작동해야 함", async () => {
      const response = await request(app).get("/memos");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);

      // regdate 역순 정렬 확인 (최신 메모가 먼저)
      if (response.body.length > 1) {
        const regdates = response.body.map((memo) => memo.regdate);
        for (let i = 0; i < regdates.length - 1; i++) {
          expect(regdates[i]).toBeGreaterThanOrEqual(regdates[i + 1]);
        }
      }
    });
  });

  describe("의존성 주입 통합 테스트", () => {
    it("컨테이너에서 모든 의존성이 올바르게 해결되어야 함", async () => {
      // 컨테이너에서 주요 의존성들이 올바르게 해결되는지 확인
      const databaseConfig = container.resolve("databaseConfig");
      const memoRepository = container.resolve("memoRepository");
      const memoReadService = container.resolve("memoReadService");
      const memoWriteService = container.resolve("memoWriteService");
      const memoValidationService = container.resolve("memoValidationService");
      const swaggerConfig = container.resolve("swaggerConfig");

      expect(databaseConfig).toBeDefined();
      expect(memoRepository).toBeDefined();
      expect(memoReadService).toBeDefined();
      expect(memoWriteService).toBeDefined();
      expect(memoValidationService).toBeDefined();
      expect(swaggerConfig).toBeDefined();
    });

    it("서비스들이 올바르게 연결되어 작동해야 함", async () => {
      // 실제 서비스 체인이 올바르게 작동하는지 확인
      const testMemo = {
        title: "의존성 테스트 메모",
        content: "이것은 의존성 주입 테스트용 메모입니다.",
      };

      // 메모 생성 (전체 서비스 체인 테스트)
      const createResponse = await request(app).post("/memos").send(testMemo);

      expect(createResponse.status).toBe(201);

      const memoId = createResponse.body.item.id;

      // 메모 조회 (읽기 서비스 테스트)
      const getResponse = await request(app).get(`/memos/${memoId}`);
      expect(getResponse.status).toBe(200);
      expect(getResponse.body.title).toBe(testMemo.title);

      // 메모 삭제 (쓰기 서비스 테스트)
      const deleteResponse = await request(app).delete(`/memos/${memoId}`);
      expect(deleteResponse.status).toBe(200);
    });
  });

  describe("에러 처리 통합 테스트", () => {
    it("잘못된 JSON 형식에 대해 적절한 에러를 반환해야 함", async () => {
      const response = await request(app)
        .post("/memos")
        .set("Content-Type", "application/json")
        .send("{ invalid json }");

      expect(response.status).toBe(400);
      expect(response.body.isSuccess).toBe(false);
      expect(response.body.message).toBe("잘못된 JSON 형식입니다. 요청 본문을 확인해주세요.");
      expect(response.body.error).toBe("Invalid JSON format");
    });

    it("Content-Type이 없는 요청에 대해 적절히 처리해야 함", async () => {
      const response = await request(app)
        .post("/memos")
        .send("title=test&content=test");

      // Express가 자동으로 처리하므로 상태 코드 확인
      expect([400, 422]).toContain(response.status);
    });

    it("매우 큰 요청에 대해 적절히 처리해야 함", async () => {
      const largeMemo = {
        title: "a".repeat(300), // 제한 초과
        content: "b".repeat(6000), // 제한 초과
      };

      const response = await request(app).post("/memos").send(largeMemo);

      expect(response.status).toBe(400);
      expect(response.body.isSuccess).toBe(false);
    });
  });

  describe("성능 및 부하 테스트", () => {
    it("동시 요청을 처리할 수 있어야 함", async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        request(app)
          .post("/memos")
          .send({
            title: `동시 요청 테스트 ${i}`,
            content: `동시 요청 테스트 내용 ${i}`,
          })
      );

      const responses = await Promise.all(promises);

      responses.forEach((response, index) => {
        expect(response.status).toBe(201);
        expect(response.body.isSuccess).toBe(true);
        expect(response.body.item.title).toBe(`동시 요청 테스트 ${index}`);
      });
    });

    it("많은 메모가 있어도 조회 성능이 유지되어야 함", async () => {
      const start = Date.now();

      const response = await request(app)
        .get("/memos")
        .query({ page: 1, pageSize: 20 });

      const duration = Date.now() - start;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(1000); // 1초 이내
    });
  });
});
