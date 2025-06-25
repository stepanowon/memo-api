const express = require("express");
const { v4: uuidv4 } = require("uuid");
const Loki = require("lokijs");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const path = require("path");
const memoService = require("./services/memoService");
const memoRoutes = require("./routes/memoRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// LokiJS DB 초기화
const db = new Loki(path.join(__dirname, "memos.db"), {
  autoload: true,
  autoloadCallback: databaseInitialize,
  autosave: true,
  autosaveInterval: 4000,
});

let memos;
function databaseInitialize() {
  memos = db.getCollection("memos");
  if (memos === null) {
    memos = db.addCollection("memos", { indices: ["id"] });
  }
  // 서비스에 memos와 db 주입
  memoService.init(memos, db);
}

app.use(express.json());

// Swagger 설정
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Memo API",
    version: "1.0.0",
    description: "A simple REST API for memos",
  },
  servers: [
    {
      url: "http://localhost:" + PORT,
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ["./routes/memoRoutes.js"],
};

const swaggerSpec = swaggerJsdoc(options);

/**
 * @swagger
 * components:
 *   schemas:
 *     Memo:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         regdate:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /memos:
 *   get:
 *     summary: Get all memos
 *     responses:
 *       200:
 *         description: List of memos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Memo'
 *   post:
 *     summary: Create a new memo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Memo created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Memo'
 *
 * /memos/{id}:
 *   get:
 *     summary: Get a memo by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Memo ID
 *     responses:
 *       200:
 *         description: Memo found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Memo'
 *       404:
 *         description: Memo not found
 *   put:
 *     summary: Update a memo by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Memo ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Memo updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Memo'
 *       404:
 *         description: Memo not found
 *   delete:
 *     summary: Delete a memo by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Memo ID
 *     responses:
 *       204:
 *         description: Memo deleted
 *       404:
 *         description: Memo not found
 */

// 기존 /memos 라우트 삭제 후 아래 코드로 대체
app.use("/memos", memoRoutes);

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Swagger JSON
app.get("/swagger.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

app.listen(PORT, () => {
  console.log(`Memo API server running at http://localhost:${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});
