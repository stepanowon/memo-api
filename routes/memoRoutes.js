const express = require("express");

function createMemoRoutes(container) {
  const router = express.Router();

  // 의존성 주입으로 서비스들 가져오기
  const memoReadService = container.resolve("memoReadService");
  const memoWriteService = container.resolve("memoWriteService");
  const memoValidationService = container.resolve("memoValidationService");

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
   *           description: 메모 고유 식별자
   *         title:
   *           type: string
   *           description: 메모 제목
   *         content:
   *           type: string
   *           description: 메모 내용
   *         regdate:
   *           type: integer
   *           format: int64
   *           description: 등록 시각 (timestamp, ms)
   *         wordCount:
   *           type: integer
   *           description: 메모 단어 수
   *         canBeModified:
   *           type: boolean
   *           description: 수정 가능 여부 (생성 후 24시간 이내)
   *         isExpired:
   *           type: boolean
   *           description: 만료 여부 (생성 후 30일 경과)
   *     MemoResponse:
   *       type: object
   *       properties:
   *         isSuccess:
   *           type: boolean
   *         message:
   *           type: string
   *         item:
   *           $ref: '#/components/schemas/Memo'
   *     MemoDeleteResponse:
   *       type: object
   *       properties:
   *         isSuccess:
   *           type: boolean
   *         message:
   *           type: string
   *     ErrorResponse:
   *       type: object
   *       properties:
   *         isSuccess:
   *           type: boolean
   *         message:
   *           type: string
   *         errors:
   *           type: array
   *           items:
   *             type: string
   */

  /**
   * @swagger
   * /memos:
   *   get:
   *     summary: Get all memos
   *     description: 메모 목록을 페이징하여 조회합니다. 등록일(regdate) 역순으로 정렬되며, 각 메모에는 도메인 정보가 포함됩니다.
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *           minimum: 1
   *         description: 페이지 번호 (1부터 시작)
   *       - in: query
   *         name: pageSize
   *         schema:
   *           type: integer
   *           default: 10
   *           minimum: 1
   *           maximum: 100
   *         description: 한 페이지당 메모 개수
   *     responses:
   *       200:
   *         description: 메모 목록 조회 성공
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Memo'
   *             example:
   *               - id: "c3fe2b14-ff09-4396-a3c3-c48b393b2db6"
   *                 title: "제목 4"
   *                 content: "내용 4"
   *                 regdate: 1751775295481
   *                 wordCount: 2
   *                 canBeModified: true
   *                 isExpired: false
   *               - id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
   *                 title: "이전 메모"
   *                 content: "이전 메모 내용"
   *                 regdate: 1751775295400
   *                 wordCount: 5
   *                 canBeModified: false
   *                 isExpired: false
   *       400:
   *         description: 잘못된 페이징 파라미터
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: 서버 오류
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.get("/", async (req, res) => {
    try {
      const validation = memoValidationService.validatePagination(
        req.query.page,
        req.query.pageSize
      );
      if (!validation.isValid) {
        return res.status(400).json({
          isSuccess: false,
          message: "잘못된 페이징 파라미터입니다.",
          errors: validation.errors,
        });
      }

      const memos = await memoReadService.getAllMemos(
        validation.page,
        validation.pageSize
      );
      res.json(memos);
    } catch (error) {
      res.status(500).json({
        isSuccess: false,
        message: "메모 목록 조회 중 오류가 발생했습니다.",
        errors: [error.message],
      });
    }
  });

  /**
   * @swagger
   * /memos:
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
   *               $ref: '#/components/schemas/MemoResponse'
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.post("/", async (req, res) => {
    try {
      const { title, content } = req.body;

      const validation = memoValidationService.validateCreateMemo(
        title,
        content
      );
      if (!validation.isValid) {
        return res.status(400).json({
          isSuccess: false,
          message: "입력 데이터가 유효하지 않습니다.",
          errors: validation.errors,
        });
      }

      const memo = await memoWriteService.createMemo(title, content);
      res.status(201).json({
        isSuccess: true,
        message: "메모가 성공적으로 등록되었습니다.",
        item: memo,
      });
    } catch (error) {
      res.status(500).json({
        isSuccess: false,
        message: "메모 생성 중 오류가 발생했습니다.",
        errors: [error.message],
      });
    }
  });

  /**
   * @swagger
   * /memos/{id}:
   *   get:
   *     summary: Get a memo by ID
   *     description: 메모 ID로 특정 메모를 조회합니다. 도메인 정보(단어수, 수정가능여부, 만료여부)가 포함됩니다.
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *           format: uuid
   *         required: true
   *         description: 조회할 메모의 ID
   *     responses:
   *       200:
   *         description: 메모 조회 성공
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Memo'
   *             example:
   *               id: "c3fe2b14-ff09-4396-a3c3-c48b393b2db6"
   *               title: "제목 4"
   *               content: "내용 4"
   *               regdate: 1751775295481
   *               wordCount: 2
   *               canBeModified: true
   *               isExpired: false
   *       404:
   *         description: 메모를 찾을 수 없음
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 isSuccess:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                   example: "조회할 메모가 없습니다."
   *       500:
   *         description: 서버 오류
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.get("/:id", async (req, res) => {
    try {
      const memo = await memoReadService.getMemoById(req.params.id);
      if (!memo) {
        return res.status(404).json({
          isSuccess: false,
          message: "조회할 메모가 없습니다.",
        });
      }
      res.json(memo);
    } catch (error) {
      res.status(500).json({
        isSuccess: false,
        message: "메모 조회 중 오류가 발생했습니다.",
        errors: [error.message],
      });
    }
  });

  /**
   * @swagger
   * /memos/{id}:
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
   *               $ref: '#/components/schemas/MemoResponse'
   *       404:
   *         description: Memo not found
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.put("/:id", async (req, res) => {
    try {
      const { title, content } = req.body;

      const validation = memoValidationService.validateUpdateMemo(
        title,
        content
      );
      if (!validation.isValid) {
        return res.status(400).json({
          isSuccess: false,
          message: "입력 데이터가 유효하지 않습니다.",
          errors: validation.errors,
        });
      }

      const memo = await memoWriteService.updateMemo(
        req.params.id,
        title,
        content
      );
      if (!memo) {
        return res.status(404).json({
          isSuccess: false,
          message: "수정할 메모가 없습니다.",
        });
      }

      res.json({
        isSuccess: true,
        message: "메모가 성공적으로 수정되었습니다.",
        item: memo,
      });
    } catch (error) {
      res.status(500).json({
        isSuccess: false,
        message: "메모 수정 중 오류가 발생했습니다.",
        errors: [error.message],
      });
    }
  });

  /**
   * @swagger
   * /memos/{id}:
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
   *       200:
   *         description: Memo deleted
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/MemoDeleteResponse'
   *       404:
   *         description: Memo not found
   */
  router.delete("/:id", async (req, res) => {
    try {
      // 먼저 메모가 존재하는지 확인
      const existingMemo = await memoReadService.getMemoById(req.params.id);
      if (!existingMemo) {
        return res.status(404).json({
          isSuccess: false,
          message: "삭제할 메모가 없습니다.",
        });
      }

      await memoWriteService.deleteMemo(req.params.id);
      res.json({
        isSuccess: true,
        message: "메모가 성공적으로 삭제되었습니다.",
      });
    } catch (error) {
      res.status(500).json({
        isSuccess: false,
        message: "메모 삭제 중 오류가 발생했습니다.",
        errors: [error.message],
      });
    }
  });

  return router;
}

module.exports = createMemoRoutes;
