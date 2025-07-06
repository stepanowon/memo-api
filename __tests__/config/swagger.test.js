const createSwaggerConfig = require("../../config/swagger");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Mock swagger dependencies
jest.mock("swagger-jsdoc");
jest.mock("swagger-ui-express");

describe("Swagger Config", () => {
  let mockSwaggerSpec;
  let mockSwaggerUiServe;
  let mockSwaggerUiSetup;

  beforeEach(() => {
    // Mock swagger spec
    mockSwaggerSpec = {
      openapi: "3.0.0",
      info: {
        title: "Memo API",
        version: "1.0.0",
        description: "A simple REST API for memos",
      },
      servers: [{ url: "http://localhost:3000" }],
      paths: {
        "/memos": {
          get: {
            summary: "Get all memos",
            responses: {
              200: {
                description: "Success",
              },
            },
          },
        },
      },
    };

    // Mock swagger UI middleware
    mockSwaggerUiServe = ["serve-middleware"];
    mockSwaggerUiSetup = jest.fn().mockReturnValue("setup-middleware");

    // Mock implementations
    swaggerJsdoc.mockReturnValue(mockSwaggerSpec);
    swaggerUi.serve = mockSwaggerUiServe;
    swaggerUi.setup = mockSwaggerUiSetup;

    // Clear mocks
    jest.clearAllMocks();
  });

  describe("createSwaggerConfig", () => {
    it("함수로 내보내져야 함", () => {
      // Then
      expect(typeof createSwaggerConfig).toBe("function");
    });

    it("기본 포트(3000)로 설정을 생성해야 함", () => {
      // When
      const swaggerConfig = createSwaggerConfig();

      // Then
      expect(swaggerConfig).toBeDefined();
      expect(typeof swaggerConfig.getSwaggerSpec).toBe("function");
      expect(typeof swaggerConfig.getSwaggerMiddleware).toBe("function");
    });

    it("사용자 지정 포트로 설정을 생성해야 함", () => {
      // Given
      const customPort = 8080;

      // When
      const swaggerConfig = createSwaggerConfig(customPort);

      // Then
      expect(swaggerConfig).toBeDefined();
      expect(typeof swaggerConfig.getSwaggerSpec).toBe("function");
      expect(typeof swaggerConfig.getSwaggerMiddleware).toBe("function");
    });

    it("포트가 문자열이어도 올바르게 처리해야 함", () => {
      // Given
      const portString = "9000";

      // When
      const swaggerConfig = createSwaggerConfig(portString);

      // Then
      expect(swaggerConfig).toBeDefined();
      expect(typeof swaggerConfig.getSwaggerSpec).toBe("function");
      expect(typeof swaggerConfig.getSwaggerMiddleware).toBe("function");
    });

    it("포트가 0이어도 올바르게 처리해야 함", () => {
      // Given
      const zeroPort = 0;

      // When
      const swaggerConfig = createSwaggerConfig(zeroPort);

      // Then
      expect(swaggerConfig).toBeDefined();
      expect(typeof swaggerConfig.getSwaggerSpec).toBe("function");
      expect(typeof swaggerConfig.getSwaggerMiddleware).toBe("function");
    });

    it("undefined 포트에 대해 기본값을 사용해야 함", () => {
      // When
      const swaggerConfig = createSwaggerConfig(undefined);

      // Then
      expect(swaggerConfig).toBeDefined();
      expect(typeof swaggerConfig.getSwaggerSpec).toBe("function");
      expect(typeof swaggerConfig.getSwaggerMiddleware).toBe("function");
    });
  });

  describe("getSwaggerSpec", () => {
    it("올바른 swagger-jsdoc 옵션으로 스펙을 생성해야 함", () => {
      // Given
      const port = 3000;
      const swaggerConfig = createSwaggerConfig(port);

      // When
      const spec = swaggerConfig.getSwaggerSpec();

      // Then
      expect(swaggerJsdoc).toHaveBeenCalledWith({
        swaggerDefinition: {
          openapi: "3.0.0",
          info: {
            title: "Memo API",
            version: "1.0.0",
            description: "A simple REST API for memos",
          },
          servers: [
            {
              url: `http://localhost:${port}`,
            },
          ],
        },
        apis: ["./routes/memoRoutes.js", "./index.js"],
      });
      expect(spec).toBe(mockSwaggerSpec);
    });

    it("사용자 지정 포트로 서버 URL을 생성해야 함", () => {
      // Given
      const customPort = 8080;
      const swaggerConfig = createSwaggerConfig(customPort);

      // When
      swaggerConfig.getSwaggerSpec();

      // Then
      expect(swaggerJsdoc).toHaveBeenCalledWith({
        swaggerDefinition: expect.objectContaining({
          servers: [
            {
              url: `http://localhost:${customPort}`,
            },
          ],
        }),
        apis: expect.any(Array),
      });
    });

    it("올바른 API 파일 경로를 포함해야 함", () => {
      // Given
      const swaggerConfig = createSwaggerConfig();

      // When
      swaggerConfig.getSwaggerSpec();

      // Then
      expect(swaggerJsdoc).toHaveBeenCalledWith({
        swaggerDefinition: expect.any(Object),
        apis: ["./routes/memoRoutes.js", "./index.js"],
      });
    });

    it("OpenAPI 3.0.0 스펙을 사용해야 함", () => {
      // Given
      const swaggerConfig = createSwaggerConfig();

      // When
      swaggerConfig.getSwaggerSpec();

      // Then
      expect(swaggerJsdoc).toHaveBeenCalledWith({
        swaggerDefinition: expect.objectContaining({
          openapi: "3.0.0",
        }),
        apis: expect.any(Array),
      });
    });

    it("올바른 API 정보를 포함해야 함", () => {
      // Given
      const swaggerConfig = createSwaggerConfig();

      // When
      swaggerConfig.getSwaggerSpec();

      // Then
      expect(swaggerJsdoc).toHaveBeenCalledWith({
        swaggerDefinition: expect.objectContaining({
          info: {
            title: "Memo API",
            version: "1.0.0",
            description: "A simple REST API for memos",
          },
        }),
        apis: expect.any(Array),
      });
    });

    it("여러 번 호출해도 동일한 결과를 반환해야 함", () => {
      // Given
      const swaggerConfig = createSwaggerConfig();

      // When
      const spec1 = swaggerConfig.getSwaggerSpec();
      const spec2 = swaggerConfig.getSwaggerSpec();

      // Then
      expect(spec1).toBe(spec2);
      expect(spec1).toBe(mockSwaggerSpec);
    });
  });

  describe("getSwaggerMiddleware", () => {
    it("올바른 미들웨어 객체를 반환해야 함", () => {
      // Given
      const swaggerConfig = createSwaggerConfig();

      // When
      const middleware = swaggerConfig.getSwaggerMiddleware();

      // Then
      expect(middleware).toEqual({
        serve: mockSwaggerUiServe,
        setup: "setup-middleware",
        spec: mockSwaggerSpec,
      });
    });

    it("swagger-ui-express의 serve 미들웨어를 포함해야 함", () => {
      // Given
      const swaggerConfig = createSwaggerConfig();

      // When
      const middleware = swaggerConfig.getSwaggerMiddleware();

      // Then
      expect(middleware.serve).toBe(mockSwaggerUiServe);
    });

    it("swagger-ui-express의 setup 미들웨어를 올바른 스펙으로 생성해야 함", () => {
      // Given
      const swaggerConfig = createSwaggerConfig();

      // When
      const middleware = swaggerConfig.getSwaggerMiddleware();

      // Then
      expect(swaggerUi.setup).toHaveBeenCalledWith(mockSwaggerSpec);
      expect(middleware.setup).toBe("setup-middleware");
    });

    it("생성된 스펙을 포함해야 함", () => {
      // Given
      const swaggerConfig = createSwaggerConfig();

      // When
      const middleware = swaggerConfig.getSwaggerMiddleware();

      // Then
      expect(middleware.spec).toBe(mockSwaggerSpec);
    });

    it("여러 번 호출해도 동일한 결과를 반환해야 함", () => {
      // Given
      const swaggerConfig = createSwaggerConfig();

      // When
      const middleware1 = swaggerConfig.getSwaggerMiddleware();
      const middleware2 = swaggerConfig.getSwaggerMiddleware();

      // Then
      expect(middleware1.serve).toBe(middleware2.serve);
      expect(middleware1.setup).toBe(middleware2.setup);
      expect(middleware1.spec).toBe(middleware2.spec);
    });
  });

  describe("port handling", () => {
    it.each([
      [3000, "http://localhost:3000"],
      [8080, "http://localhost:8080"],
      [9000, "http://localhost:9000"],
      [80, "http://localhost:80"],
      [443, "http://localhost:443"],
    ])(
      "포트 %i에 대해 올바른 서버 URL %s을 생성해야 함",
      (port, expectedUrl) => {
        // Given
        const swaggerConfig = createSwaggerConfig(port);

        // When
        swaggerConfig.getSwaggerSpec();

        // Then
        expect(swaggerJsdoc).toHaveBeenCalledWith({
          swaggerDefinition: expect.objectContaining({
            servers: [{ url: expectedUrl }],
          }),
          apis: expect.any(Array),
        });
      }
    );

    it("문자열 포트를 올바르게 처리해야 함", () => {
      // Given
      const swaggerConfig = createSwaggerConfig("7000");

      // When
      swaggerConfig.getSwaggerSpec();

      // Then
      expect(swaggerJsdoc).toHaveBeenCalledWith({
        swaggerDefinition: expect.objectContaining({
          servers: [{ url: "http://localhost:7000" }],
        }),
        apis: expect.any(Array),
      });
    });

    it("null 포트는 문자열로 변환되어야 함", () => {
      // Given
      const swaggerConfig = createSwaggerConfig(null);

      // When
      swaggerConfig.getSwaggerSpec();

      // Then
      expect(swaggerJsdoc).toHaveBeenCalledWith({
        swaggerDefinition: expect.objectContaining({
          servers: [{ url: "http://localhost:null" }],
        }),
        apis: expect.any(Array),
      });
    });
  });

  describe("integration scenarios", () => {
    it("전체 워크플로우가 올바르게 동작해야 함", () => {
      // Given
      const port = 4000;
      const swaggerConfig = createSwaggerConfig(port);

      // When
      const spec = swaggerConfig.getSwaggerSpec();
      const middleware = swaggerConfig.getSwaggerMiddleware();

      // Then
      // 스펙 생성 확인
      expect(swaggerJsdoc).toHaveBeenCalledWith({
        swaggerDefinition: {
          openapi: "3.0.0",
          info: {
            title: "Memo API",
            version: "1.0.0",
            description: "A simple REST API for memos",
          },
          servers: [{ url: `http://localhost:${port}` }],
        },
        apis: ["./routes/memoRoutes.js", "./index.js"],
      });

      // 미들웨어 생성 확인
      expect(swaggerUi.setup).toHaveBeenCalledWith(mockSwaggerSpec);

      // 반환값 확인
      expect(spec).toBe(mockSwaggerSpec);
      expect(middleware).toEqual({
        serve: mockSwaggerUiServe,
        setup: "setup-middleware",
        spec: mockSwaggerSpec,
      });
    });

    it("여러 인스턴스가 독립적으로 동작해야 함", () => {
      // Given
      const config1 = createSwaggerConfig(3000);
      const config2 = createSwaggerConfig(8080);

      // When
      const spec1 = config1.getSwaggerSpec();
      const spec2 = config2.getSwaggerSpec();

      // Then
      expect(swaggerJsdoc).toHaveBeenCalledTimes(2);
      expect(swaggerJsdoc).toHaveBeenNthCalledWith(1, {
        swaggerDefinition: expect.objectContaining({
          servers: [{ url: "http://localhost:3000" }],
        }),
        apis: expect.any(Array),
      });
      expect(swaggerJsdoc).toHaveBeenNthCalledWith(2, {
        swaggerDefinition: expect.objectContaining({
          servers: [{ url: "http://localhost:8080" }],
        }),
        apis: expect.any(Array),
      });
    });

    it("스펙과 미들웨어가 일관된 데이터를 사용해야 함", () => {
      // Given
      const swaggerConfig = createSwaggerConfig(5000);

      // When
      const spec = swaggerConfig.getSwaggerSpec();
      const middleware = swaggerConfig.getSwaggerMiddleware();

      // Then
      expect(spec).toBe(middleware.spec);
      expect(spec).toBe(mockSwaggerSpec);
    });
  });

  describe("error handling", () => {
    it("swagger-jsdoc 실패 시 에러를 전파해야 함", () => {
      // Given
      const error = new Error("Swagger spec generation failed");
      swaggerJsdoc.mockImplementation(() => {
        throw error;
      });
      const swaggerConfig = createSwaggerConfig();

      // When & Then
      expect(() => swaggerConfig.getSwaggerSpec()).toThrow(
        "Swagger spec generation failed"
      );
    });

    it("swagger-ui setup 실패 시 에러를 전파해야 함", () => {
      // Given
      const error = new Error("Swagger UI setup failed");
      swaggerUi.setup.mockImplementation(() => {
        throw error;
      });
      const swaggerConfig = createSwaggerConfig();

      // When & Then
      expect(() => swaggerConfig.getSwaggerMiddleware()).toThrow(
        "Swagger UI setup failed"
      );
    });

    it("잘못된 포트 값은 문자열로 변환되어야 함", () => {
      // Given
      const testCases = [
        [NaN, "http://localhost:NaN"],
        [-1, "http://localhost:-1"],
        ["invalid", "http://localhost:invalid"],
        [{}, "http://localhost:[object Object]"],
        [[], "http://localhost:"],
      ];

      testCases.forEach(([port, expectedUrl]) => {
        // When
        const swaggerConfig = createSwaggerConfig(port);
        swaggerConfig.getSwaggerSpec();

        // Then
        expect(swaggerJsdoc).toHaveBeenCalledWith({
          swaggerDefinition: expect.objectContaining({
            servers: [{ url: expectedUrl }],
          }),
          apis: expect.any(Array),
        });
      });
    });
  });

  describe("configuration validation", () => {
    it("생성된 설정이 올바른 구조를 가져야 함", () => {
      // Given
      const swaggerConfig = createSwaggerConfig();

      // When
      const spec = swaggerConfig.getSwaggerSpec();

      // Then
      expect(swaggerJsdoc).toHaveBeenCalledWith({
        swaggerDefinition: expect.objectContaining({
          openapi: expect.any(String),
          info: expect.objectContaining({
            title: expect.any(String),
            version: expect.any(String),
            description: expect.any(String),
          }),
          servers: expect.arrayContaining([
            expect.objectContaining({
              url: expect.any(String),
            }),
          ]),
        }),
        apis: expect.any(Array),
      });
    });

    it("API 파일 경로가 배열이어야 함", () => {
      // Given
      const swaggerConfig = createSwaggerConfig();

      // When
      swaggerConfig.getSwaggerSpec();

      // Then
      expect(swaggerJsdoc).toHaveBeenCalledWith({
        swaggerDefinition: expect.any(Object),
        apis: expect.any(Array),
      });

      const [options] = swaggerJsdoc.mock.calls[0];
      expect(Array.isArray(options.apis)).toBe(true);
      expect(options.apis.length).toBeGreaterThan(0);
    });

    it("서버 설정이 배열이어야 함", () => {
      // Given
      const swaggerConfig = createSwaggerConfig();

      // When
      swaggerConfig.getSwaggerSpec();

      // Then
      const [options] = swaggerJsdoc.mock.calls[0];
      expect(Array.isArray(options.swaggerDefinition.servers)).toBe(true);
      expect(options.swaggerDefinition.servers.length).toBe(1);
    });
  });
});
