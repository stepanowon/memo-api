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
   *         title:
   *           type: string
   *         content:
   *           type: string
   *         regdate:
   *           type: integer
   *           format: int64
   *           description: 등록 시각 (timestamp, ms)
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
   *     description: 페이징(page, pageSize) 및 등록일(regdate) 역순 정렬 지원
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: 페이지 번호 (1부터 시작)
   *       - in: query
   *         name: pageSize
   *         schema:
   *           type: integer
   *           default: 10
   *         description: 한 페이지당 메모 개수
   *     responses:
   *       200:
   *         description: List of memos
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Memo'
   *       400:
   *         description: Invalid pagination parameters
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
