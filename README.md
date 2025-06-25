# Memo API

간단한 메모 관리 REST API입니다. Express, LokiJS, Swagger를 사용합니다.

## 기술 스택

- **Node.js**: JavaScript 런타임
- **Express.js**: 웹 프레임워크
- **LokiJS**: 인메모리 NoSQL 데이터베이스
- **Swagger**: API 문서화 및 테스트 도구
  - swagger-jsdoc: JSDoc 주석으로 Swagger 스펙 생성
  - swagger-ui-express: Swagger UI 제공
- **UUID**: 고유 식별자 생성
- **Nodemon**: 개발 중 자동 재시작 (개발 의존성)

## 프로젝트 구조

```
memo-api/
├── index.js              # 메인 서버 파일 (Express 설정, Swagger 설정)
├── package.json          # 프로젝트 의존성 및 스크립트
├── README.md            # 프로젝트 문서
├── memos.db             # LokiJS 데이터베이스 파일 (자동 생성)
├── routes/
│   └── memoRoutes.js    # 메모 관련 라우트 정의
└── services/
    └── memoService.js   # 메모 비즈니스 로직
```

## 환경 설정

환경 변수를 사용하여 설정을 변경할 수 있습니다. 프로젝트 루트에 `.env` 파일을 생성하여 설정하세요.

### 환경 변수 예시

```bash
# .env 파일
PORT=3000
```

### 지원하는 환경 변수

- `PORT`: 서버 포트 (기본값: 3000)

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 프로덕션 모드 실행

```bash
npm start
```

### 3. 개발 모드 실행 (자동 재시작)

```bash
npm run dev
```

서버가 실행되면 다음 주소에서 접근할 수 있습니다:

- **API**: http://localhost:3000
- **Swagger 문서**: http://localhost:3000/api-docs
- **Swagger JSON**: http://localhost:3000/swagger.json

## Swagger 문서

Swagger UI를 통해 API 명세와 테스트가 가능합니다.

- [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

## 주요 API 엔드포인트

### 1. 메모 목록 조회 (페이징, 최신순)

```
GET /memos?page=1&pageSize=10
```

- 쿼리 파라미터
  - `page`: 페이지 번호 (기본값 1)
  - `pageSize`: 한 페이지당 개수 (기본값 10)
- 응답: 메모 배열 (최신 등록순)

### 2. 메모 등록

```
POST /memos
Content-Type: application/json
{
  "title": "제목",
  "content": "내용"
}
```

- 응답 예시

```json
{
  "isSuccess": true,
  "message": "메모가 성공적으로 등록되었습니다.",
  "item": {
    "id": "...",
    "title": "제목",
    "content": "내용",
    "regdate": 1721440000000
  }
}
```

### 3. 메모 단건 조회

```
GET /memos/{id}
```

- 응답 예시

```json
{
  "id": "...",
  "title": "제목",
  "content": "내용",
  "regdate": 1721440000000
}
```

### 4. 메모 수정

```
PUT /memos/{id}
Content-Type: application/json
{
  "title": "수정된 제목",
  "content": "수정된 내용"
}
```

- 응답 예시

```json
{
  "isSuccess": true,
  "message": "메모가 성공적으로 수정되었습니다.",
  "item": {
    "id": "...",
    "title": "수정된 제목",
    "content": "수정된 내용",
    "regdate": 1721440000000
  }
}
```

### 5. 메모 삭제

```
DELETE /memos/{id}
```

- 응답 예시

```json
{
  "isSuccess": true,
  "message": "메모가 성공적으로 삭제되었습니다."
}
```

## 에러 응답 예시

- 필수값 누락, 없는 메모 접근 등

```json
{
  "isSuccess": false,
  "message": "오류 메시지",
  "item": null
}
```

## 데이터베이스

- **LokiJS**: 파일 기반 인메모리 NoSQL 데이터베이스 사용
- **데이터 파일**: `memos.db` (프로젝트 루트에 자동 생성)
- **자동 저장**: 4초마다 자동으로 데이터 저장
- **자동 로드**: 서버 시작 시 기존 데이터 자동 로드

## 개발 정보

- **개발 서버**: Nodemon을 사용하여 파일 변경 시 자동 재시작
- **API 테스트**: Swagger UI를 통해 브라우저에서 직접 테스트 가능
- **데이터 영속성**: 서버 재시작 후에도 데이터 유지됨

## 추가 정보

- 자세한 API 명세와 테스트는 Swagger UI에서 확인하세요
- 모든 API는 JSON 형식으로 요청/응답합니다
- UUID를 사용하여 메모의 고유 식별자를 생성합니다
