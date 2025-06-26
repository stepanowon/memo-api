// 이 파일은 더 이상 사용되지 않습니다.
// 새로운 아키텍처에서는 다음 서비스들로 분리되었습니다:
// - MemoReadService: 읽기 전용 작업
// - MemoWriteService: 쓰기 작업
// - MemoValidationService: 검증 로직
// - MemoRepository: 데이터 접근 계층

// 하위 호환성을 위해 남겨두었지만, 새로운 코드에서는 사용하지 마세요.

console.warn(
  "⚠️  services/memoService.js는 더 이상 사용되지 않습니다. 새로운 분리된 서비스들을 사용하세요."
);

module.exports = {
  // 빈 모듈 (하위 호환성용)
};
