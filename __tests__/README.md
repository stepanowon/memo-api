# 메모 API 테스트 가이드

이 디렉토리는 메모 API의 단위 테스트와 통합 테스트를 포함합니다.

## 테스트 구조

```
__tests__/
├── helpers/           # 테스트 헬퍼 함수들
│   └── testHelpers.js
├── mocks/            # 목(Mock) 객체들
│   └── mockContainer.js
├── routes/           # 라우트 테스트
│   ├── memoRoutes.test.js
│   └── healthRoutes.test.js
├── services/         # 서비스 계층 테스트
│   ├── MemoReadService.test.js
│   ├── MemoWriteService.test.js
│   └── MemoValidationService.test.js
└── README.md
```

## 테스트 실행 방법

### 1. 의존성 설치

```bash
npm install
```

### 2. 모든 테스트 실행

```bash
npm test
```

### 3. 테스트 감시 모드 (개발 중)

```bash
npm run test:watch
```

### 4. 테스트 커버리지 확인

```bash
npm run test:coverage
```

## 테스트 범위

### API 엔드포인트 테스트 (Swagger 기반)

#### 1. GET /memos

- ✅ 전체 메모 목록 조회
- ✅ 페이징 파라미터 처리
- ✅ 잘못된 페이징 파라미터 검증
- ✅ 서버 에러 처리

#### 2. POST /memos

- ✅ 새 메모 생성
- ✅ 입력 데이터 검증
- ✅ 서버 에러 처리

#### 3. GET /memos/:id

- ✅ ID로 메모 조회
- ✅ 존재하지 않는 메모 처리
- ✅ 서버 에러 처리

#### 4. PUT /memos/:id

- ✅ 메모 수정
- ✅ 부분 업데이트 (제목만/내용만)
- ✅ 입력 데이터 검증
- ✅ 존재하지 않는 메모 처리
- ✅ 서버 에러 처리

#### 5. DELETE /memos/:id

- ✅ 메모 삭제
- ✅ 존재하지 않는 메모 처리
- ✅ 서버 에러 처리

#### 6. GET /health

- ✅ 헬스체크 응답
- ✅ 응답 구조 검증

### 서비스 계층 테스트

#### MemoReadService

- ✅ 전체 메모 조회 (`getAllMemos`)
- ✅ ID로 메모 조회 (`getMemoById`)
- ✅ 메모 존재 확인 (`getMemoExists`)
- ✅ 만료된 메모 조회 (`getExpiredMemos`)
- ✅ 도메인 엔터티 메서드 추가 검증
- ✅ 에러 처리

#### MemoWriteService

- ✅ 메모 생성 (`createMemo`)
- ✅ 메모 수정 (`updateMemo`)
- ✅ 부분 업데이트 처리
- ✅ 메모 삭제 (`deleteMemo`)
- ✅ 24시간 제한 규칙 검증
- ✅ 에러 처리

#### MemoValidationService

- ✅ 메모 생성 검증 (`validateCreateMemo`)
- ✅ 메모 수정 검증 (`validateUpdateMemo`)
- ✅ 페이징 검증 (`validatePagination`)
- ✅ 메모 ID 검증 (`validateMemoId`)
- ✅ 경계값 테스트 (길이 제한 등)

## 테스트 패턴

### Given-When-Then 패턴

모든 테스트는 다음 패턴을 따릅니다:

```javascript
it("테스트 설명", async () => {
  // Given - 테스트 준비
  const testData = createTestMemo();

  // When - 실행
  const result = await service.someMethod(testData);

  // Then - 검증
  expect(result).toBeDefined();
});
```

### Mock 사용

- 의존성 주입을 통한 서비스 분리
- Repository 계층 목킹
- 컨테이너 기반 의존성 관리

### 검증 헬퍼

- `validateMemoResponse()`: 메모 응답 구조 검증
- `validateApiResponse()`: API 응답 구조 검증
- `validateErrorResponse()`: 에러 응답 구조 검증

## 테스트 데이터

### 테스트 메모 생성

```javascript
const testMemo = createTestMemo({
  id: "custom-id",
  title: "커스텀 제목",
  content: "커스텀 내용",
  regdate: Date.now(),
});
```

### 테스트 메모 배열 생성

```javascript
const testMemos = createTestMemos(5); // 5개의 테스트 메모 생성
```

## 에러 테스트 시나리오

1. **검증 에러**: 잘못된 입력 데이터
2. **Not Found 에러**: 존재하지 않는 리소스
3. **서버 에러**: Repository/Database 에러
4. **도메인 규칙 위반**: 24시간 제한 등

## 커버리지 목표

- **라인 커버리지**: 90% 이상
- **함수 커버리지**: 100%
- **브랜치 커버리지**: 85% 이상

## 주의사항

1. 테스트는 서로 독립적이어야 합니다
2. 각 테스트 전에 Mock이 초기화됩니다
3. 실제 데이터베이스를 사용하지 않습니다
4. 모든 비동기 작업은 적절히 대기해야 합니다

## 추가 테스트 작성 가이드

새로운 기능을 추가할 때는 다음을 포함해야 합니다:

1. **Happy Path**: 정상적인 실행 경로
2. **Edge Cases**: 경계값 테스트
3. **Error Cases**: 에러 상황 처리
4. **Validation**: 입력 검증 테스트

예시:

```javascript
describe("새로운 기능", () => {
  it("정상 케이스를 처리해야 함", async () => {
    // 테스트 코드
  });

  it("경계값을 올바르게 처리해야 함", async () => {
    // 테스트 코드
  });

  it("에러 상황을 적절히 처리해야 함", async () => {
    // 테스트 코드
  });
});
```
