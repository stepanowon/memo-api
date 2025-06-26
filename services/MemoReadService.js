const { createMemoFromData } = require("../entities/Memo");

const createMemoReadService = (memoRepository) => {
  const getAllMemos = async (page = 1, pageSize = 10) => {
    try {
      const memosData = await memoRepository.findAll(page, pageSize);

      // 도메인 엔터티로 변환하여 비즈니스 로직 적용 가능
      return memosData.map((memoData) => {
        const memoEntity = createMemoFromData(memoData);
        return {
          ...memoEntity.toPlainObject(),
          // 도메인 메서드를 통한 추가 정보
          wordCount: memoEntity.getWordCount(),
          canBeModified: memoEntity.canBeModified(),
          isExpired: memoEntity.isExpired(),
        };
      });
    } catch (error) {
      throw new Error(
        `메모 목록 조회 중 오류가 발생했습니다: ${error.message}`
      );
    }
  };

  const getMemoById = async (id) => {
    try {
      if (!id) {
        throw new Error("메모 ID가 필요합니다.");
      }

      const memoData = await memoRepository.findById(id);
      if (!memoData) {
        return null;
      }

      // 도메인 엔터티로 변환하여 추가 정보 제공
      const memoEntity = createMemoFromData(memoData);
      return {
        ...memoEntity.toPlainObject(),
        wordCount: memoEntity.getWordCount(),
        canBeModified: memoEntity.canBeModified(),
        isExpired: memoEntity.isExpired(),
      };
    } catch (error) {
      throw new Error(`메모 조회 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  const getMemoExists = async (id) => {
    try {
      const memo = await getMemoById(id);
      return memo !== null;
    } catch (error) {
      return false;
    }
  };

  const getExpiredMemos = async () => {
    try {
      // 모든 메모를 가져와서 만료된 것들만 필터링
      const allMemosData = await memoRepository.findAll(1, 1000); // 임시로 큰 수

      return allMemosData
        .map((memoData) => createMemoFromData(memoData))
        .filter((memoEntity) => memoEntity.isExpired())
        .map((memoEntity) => memoEntity.toPlainObject());
    } catch (error) {
      throw new Error(
        `만료된 메모 조회 중 오류가 발생했습니다: ${error.message}`
      );
    }
  };

  return {
    getAllMemos,
    getMemoById,
    getMemoExists,
    getExpiredMemos,
  };
};

module.exports = createMemoReadService;
