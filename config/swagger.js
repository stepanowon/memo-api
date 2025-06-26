const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const createSwaggerConfig = (port = 3000) => {
  const swaggerDefinition = {
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
  };

  const getSwaggerSpec = () => {
    const options = {
      swaggerDefinition,
      apis: ["./routes/memoRoutes.js", "./index.js"],
    };
    return swaggerJsdoc(options);
  };

  const getSwaggerMiddleware = () => {
    const swaggerSpec = getSwaggerSpec();
    return {
      serve: swaggerUi.serve,
      setup: swaggerUi.setup(swaggerSpec),
      spec: swaggerSpec,
    };
  };

  return {
    getSwaggerSpec,
    getSwaggerMiddleware,
  };
};

module.exports = createSwaggerConfig;
