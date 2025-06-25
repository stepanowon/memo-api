const express = require("express");
const router = express.Router();
const memoService = require("../services/memoService");

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
 *               $ref: '#/components/schemas/MemoResponse'
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
 *       200:
 *         description: Memo deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MemoDeleteResponse'
 *       404:
 *         description: Memo not found
 */

// 메모 전체 조회
router.get("/", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  res.json(memoService.getAllMemos(page, pageSize));
});

// 메모 생성
router.post("/", (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({
      isSuccess: false,
      message: "title, content 필드는 반드시 입력해야 합니다.",
      item: null,
    });
  }
  const memo = memoService.createMemo(title, content);
  res.status(201).json({
    isSuccess: true,
    message: "메모가 성공적으로 등록되었습니다.",
    item: memo,
  });
});

// 메모 단건 조회
router.get("/:id", (req, res) => {
  const memo = memoService.getMemoById(req.params.id);
  if (!memo) {
    return res.status(404).json({ error: "조회할 메모가 없습니다." });
  }
  res.json(memo);
});

// 메모 수정
router.put("/:id", (req, res) => {
  const { title, content } = req.body;
  const memo = memoService.updateMemo(req.params.id, title, content);
  if (!memo) {
    return res.status(404).json({
      isSuccess: false,
      message: "수정할 메모가 없습니다.",
      item: null,
    });
  }
  res.json({
    isSuccess: true,
    message: "메모가 성공적으로 수정되었습니다.",
    item: memo,
  });
});

// 메모 삭제
router.delete("/:id", (req, res) => {
  const memo = memoService.getMemoById(req.params.id);
  if (!memo) {
    return res
      .status(404)
      .json({ isSuccess: false, message: "삭제할 메모가 없습니다." });
  }
  memoService.deleteMemo(req.params.id);
  res.json({ isSuccess: true, message: "메모가 성공적으로 삭제되었습니다." });
});

module.exports = router;
