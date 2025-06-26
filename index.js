const express = require("express");
const { setupContainer } = require("./container/containerSetup");
const createMemoRoutes = require("./routes/memoRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // 의존성 주입 컨테이너 설정
    const container = await setupContainer(PORT);

    // Express 미들웨어 설정
    app.use(express.json());

    // Swagger 설정
    const swaggerConfig = container.resolve("swaggerConfig");
    const swaggerMiddleware = swaggerConfig.getSwaggerMiddleware();

    // 라우트 설정 (의존성 주입)
    const memoRoutes = createMemoRoutes(container);
    app.use("/memos", memoRoutes);

    // Swagger UI 설정
    app.use("/api-docs", swaggerMiddleware.serve, swaggerMiddleware.setup);

    /**
     * @swagger
     * /swagger.json:
     *   get:
     *     summary: Get OpenAPI specification in JSON format
     *     description: Returns the complete OpenAPI 3.0 specification document
     *     tags:
     *       - Documentation
     *     responses:
     *       200:
     *         description: OpenAPI specification document
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               description: Complete OpenAPI 3.0 specification
     */
    // Swagger JSON 엔드포인트
    app.get("/swagger.json", (req, res) => {
      res.setHeader("Content-Type", "application/json");
      res.send(swaggerMiddleware.spec);
    });

    /**
     * @swagger
     * /health:
     *   get:
     *     summary: Health check endpoint
     *     description: Returns server health status and uptime information
     *     tags:
     *       - System
     *     responses:
     *       200:
     *         description: Server is healthy
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: "OK"
     *                 timestamp:
     *                   type: string
     *                   format: date-time
     *                   example: "2024-01-01T00:00:00.000Z"
     *                 uptime:
     *                   type: number
     *                   description: Server uptime in seconds
     *                   example: 123.456
     */
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
      console.error("서버 오류:", error);
      res.status(500).json({
        isSuccess: false,
        message: "서버 내부 오류가 발생했습니다.",
      });
    });

    // 서버 시작
    app.listen(PORT, () => {
      console.log(`🚀 Memo API server running at http://localhost:${PORT}`);
      console.log(
        `📚 Swagger UI available at http://localhost:${PORT}/api-docs`
      );
      console.log(
        `💓 Health check available at http://localhost:${PORT}/health`
      );
    });
  } catch (error) {
    console.error("서버 시작 중 오류가 발생했습니다:", error);
    process.exit(1);
  }
}

// 서버 시작
startServer();
