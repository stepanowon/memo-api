const { createNewMemo, createMemoFromData } = require("../entities/Memo");

const createMemoWriteService = (memoRepository) => {
  const createMemo = async (title, content) => {
    try {
      // 도메인 엔터티를 통해 메모 생성 (비즈니스 규칙 검증 포함)
      const memoEntity = createNewMemo(title, content);

      // Repository에는 plain object로 저장
      const memoData = memoEntity.toPlainObject();
      return await memoRepository.create(memoData);
    } catch (error) {
      throw new Error(`메모 생성 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  const updateMemo = async (id, title, content) => {
    try {
      if (!id) {
        throw new Error("메모 ID가 필요합니다.");
      }

      // 기존 메모 조회
      const existingMemoData = await memoRepository.findById(id);
      if (!existingMemoData) {
        return null;
      }

      // 도메인 엔터티로 변환
      const existingMemo = createMemoFromData(existingMemoData);

      // 도메인 규칙에 따라 업데이트 (24시간 제한 등)
      const updatedMemo = existingMemo.updateContent(title, content);

      // Repository에 업데이트
      const updates = {};
      if (title !== undefined) {
        updates.title = updatedMemo.getTitle();
      }
      if (content !== undefined) {
        updates.content = updatedMemo.getContent();
      }

      return await memoRepository.update(id, updates);
    } catch (error) {
      throw new Error(`메모 수정 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  const deleteMemo = async (id) => {
    try {
      if (!id) {
        throw new Error("메모 ID가 필요합니다.");
      }

      // 삭제 전 비즈니스 규칙 검증 (필요시)
      const existingMemoData = await memoRepository.findById(id);
      if (!existingMemoData) {
        return false;
      }

      const existingMemo = createMemoFromData(existingMemoData);

      // 도메인 규칙: 만료된 메모는 자동 삭제 허용, 그 외는 수정 가능 시간 내에서만 삭제 가능
      if (!existingMemo.isExpired() && !existingMemo.canBeModified()) {
        throw new Error("생성 후 24시간이 지난 메모는 삭제할 수 없습니다.");
      }

      return await memoRepository.delete(id);
    } catch (error) {
      throw new Error(`메모 삭제 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  return {
    createMemo,
    updateMemo,
    deleteMemo,
  };
};

module.exports = createMemoWriteService;
