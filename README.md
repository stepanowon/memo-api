# Memo API

🚀 **클린 아키텍처**와 **SOLID 원칙**을 적용한 엔터프라이즈급 메모 관리 REST API입니다.

## ✨ 주요 특징

- 🏛️ **클린 아키텍처**: 계층별 완벽한 분리와 의존성 역전
- 🔧 **SOLID 원칙**: 5가지 객체지향 설계 원칙 완벽 준수
- 📦 **의존성 주입**: DI Container를 통한 느슨한 결합
- 🔄 **Function-based**: TypeScript Arrow Function 스타일의 함수형 접근
- 🛡️ **Rich Domain Model**: 비즈니스 로직이 도메인 엔터티에 캡슐화
- 📋 **DTO 패턴**: 계층 간 안전한 데이터 전송
- 🧪 **테스트 친화적**: 모든 의존성이 주입되어 완벽한 단위 테스트 가능

## 🏗️ 아키텍처 구조

```
memo-api/
├── 🏛️ entities/              # 도메인 엔터티 (가장 안쪽 계층)
│   └── Memo.js               # 핵심 비즈니스 규칙과 도메인 로직
├── 📋 dto/                   # 데이터 전송 객체
│   └── MemoDto.js            # Request/Response DTO 정의
├── 🔄 services/              # 유스케이스 (애플리케이션 비즈니스 로직)
│   ├── MemoReadService.js    # 읽기 전용 유스케이스
│   ├── MemoWriteService.js   # 쓰기 전용 유스케이스
│   └── MemoValidationService.js # 검증 유스케이스
├── 🔌 repositories/          # 데이터 접근 인터페이스
│   └── MemoRepository.js     # Repository 패턴 구현
├── 🌐 routes/                # HTTP 인터페이스 어댑터
│   └── memoRoutes.js         # RESTful API 엔드포인트
├── ⚙️ config/                # 외부 도구 설정
│   ├── database.js           # 데이터베이스 설정
│   └── swagger.js            # API 문서화 설정
├── 📦 container/             # 의존성 주입
│   ├── DIContainer.js        # DI 컨테이너 구현
│   └── containerSetup.js     # 의존성 구성
├── index.js                  # 애플리케이션 진입점
├── package.json              # 프로젝트 의존성
└── memos.db                  # LokiJS 데이터베이스 파일
```

## 🎯 클린 아키텍처 계층

### 1. 🏛️ **Entities (도메인 엔터티)**

- 핵심 비즈니스 규칙과 로직
- 프레임워크에 완전히 독립적
- 도메인 메서드: `canBeModified()`, `isExpired()`, `getWordCount()`

### 2. 📋 **Use Cases (유스케이스)**

- 애플리케이션별 비즈니스 규칙
- 도메인 엔터티를 조율하는 역할
- 읽기/쓰기/검증 서비스로 분리

### 3. 🔌 **Interface Adapters (인터페이스 어댑터)**

- 외부 세계와 내부 유스케이스 간 데이터 변환
- Controllers, Gateways, Presenters
- DTO 패턴을 통한 안전한 데이터 전송

### 4. 🌐 **Frameworks & Drivers (프레임워크 & 드라이버)**

- 외부 도구들 (Express, LokiJS, Swagger)
- 가장 바깥쪽 계층

## 🔧 기술 스택

### Core

- **Node.js**: JavaScript 런타임
- **Express.js**: 웹 프레임워크
- **LokiJS**: 인메모리 NoSQL 데이터베이스

### Architecture

- **Clean Architecture**: 계층별 의존성 관리
- **SOLID Principles**: 객체지향 설계 원칙
- **Dependency Injection**: 의존성 주입 패턴
- **Repository Pattern**: 데이터 접근 추상화
- **DTO Pattern**: 데이터 전송 객체

### Documentation & Testing

- **Swagger**: API 문서화 및 테스트 도구
- **UUID**: 고유 식별자 생성
- **Nodemon**: 개발 중 자동 재시작

## 🚀 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 프로덕션 모드 실행

```bash
npm start
```

### 3. 개발 모드 실행

```bash
npm run dev
```

### 4. 접근 URL

- **API**: http://localhost:3000
- **Swagger 문서**: http://localhost:3000/api-docs
- **헬스체크**: http://localhost:3000/health
- **Swagger JSON**: http://localhost:3000/swagger.json

## 📋 API 엔드포인트

### 🔍 메모 목록 조회 (페이징, 최신순)

```http
GET /memos?page=1&pageSize=10
```

**응답 예시:**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "메모 제목",
    "content": "메모 내용",
    "regdate": 1721440000000,
    "wordCount": 15,
    "canBeModified": true,
    "isExpired": false
  }
]
```

### ✏️ 메모 생성

```http
POST /memos
Content-Type: application/json

{
  "title": "새 메모 제목",
  "content": "새 메모 내용"
}
```

**응답 예시:**

```json
{
  "isSuccess": true,
  "message": "메모가 성공적으로 등록되었습니다.",
  "item": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "새 메모 제목",
    "content": "새 메모 내용",
    "regdate": 1721440000000
  }
}
```

### 📖 메모 단건 조회

```http
GET /memos/{id}
```

### ✏️ 메모 수정

```http
PUT /memos/{id}
Content-Type: application/json

{
  "title": "수정된 제목",
  "content": "수정된 내용"
}
```

### 🗑️ 메모 삭제

```http
DELETE /memos/{id}
```

### 💓 헬스체크

```http
GET /health
```

**응답 예시:**

```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

## 🛡️ 비즈니스 규칙

### 📝 메모 엔터티 규칙

- **제목**: 1-200자 필수
- **내용**: 1-5000자 필수
- **수정 제한**: 생성 후 24시간 이내만 수정 가능
- **만료**: 생성 후 30일 후 만료
- **삭제 제한**: 24시간 이후 생성된 메모는 삭제 불가 (만료된 메모 제외)

### 🔍 추가 정보

- **단어 수**: 자동 계산 및 제공
- **수정 가능 여부**: 실시간 확인
- **만료 상태**: 자동 판별

## 🎯 SOLID 원칙 적용

### 1. **SRP (Single Responsibility Principle)**

- 각 서비스가 단일 책임만 가짐
- 읽기/쓰기/검증 서비스 분리

### 2. **OCP (Open/Closed Principle)**

- Repository 패턴으로 새로운 데이터베이스 쉽게 추가
- 기존 코드 수정 없이 확장 가능

### 3. **LSP (Liskov Substitution Principle)**

- 모든 Repository 구현체가 완전히 교체 가능
- 인터페이스 준수 보장

### 4. **ISP (Interface Segregation Principle)**

- 클라이언트별 필요한 인터페이스만 제공
- 불필요한 의존성 제거

### 5. **DIP (Dependency Inversion Principle)**

- 모든 의존성이 추상화를 통해 주입
- 구체적 구현체에 직접 의존하지 않음

## 🔄 의존성 주입

### DI Container 사용

```javascript
// 서비스 등록
container.register(
  "memoRepository",
  () => createLokiMemoRepository(collection, database),
  { singleton: true }
);

container.register(
  "memoWriteService",
  (container) => createMemoWriteService(container.resolve("memoRepository")),
  { singleton: true }
);

// 서비스 사용
const memoWriteService = container.resolve("memoWriteService");
```

## 🧪 테스트 가능성

### 완벽한 의존성 주입으로 테스트 용이

```javascript
// Mock Repository 주입
const mockRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const writeService = createMemoWriteService(mockRepository);
```

## 🔧 환경 설정

### 환경 변수

```bash
# .env 파일
PORT=3000
```

### 지원하는 환경 변수

- `PORT`: 서버 포트 (기본값: 3000)

## 📊 에러 응답

### 검증 오류

```json
{
  "isSuccess": false,
  "message": "입력 데이터가 유효하지 않습니다.",
  "errors": [
    "제목은 필수 입력 항목입니다.",
    "내용은 5000자를 초과할 수 없습니다."
  ]
}
```

### 비즈니스 규칙 위반

```json
{
  "isSuccess": false,
  "message": "메모 수정 중 오류가 발생했습니다.",
  "errors": ["생성 후 24시간이 지난 메모는 수정할 수 없습니다."]
}
```

## 💾 데이터베이스

- **LokiJS**: 파일 기반 인메모리 NoSQL 데이터베이스
- **데이터 파일**: `memos.db` (자동 생성)
- **자동 저장**: 4초마다 자동 저장
- **자동 로드**: 서버 시작 시 기존 데이터 로드

## 🔮 확장 가능성

### 새로운 데이터베이스 추가

```javascript
// MongoDB Repository 구현 예시
const createMongoMemoRepository = (mongoConnection) => {
  return {
    findAll: async (page, pageSize) => {
      /* MongoDB 구현 */
    },
    findById: async (id) => {
      /* MongoDB 구현 */
    },
    create: async (memo) => {
      /* MongoDB 구현 */
    },
    update: async (id, updates) => {
      /* MongoDB 구현 */
    },
    delete: async (id) => {
      /* MongoDB 구현 */
    },
  };
};

// DI Container에 등록
container.register("memoRepository", () =>
  createMongoMemoRepository(mongoConnection)
);
```

### 새로운 인터페이스 추가

- GraphQL API
- CLI 인터페이스
- WebSocket 실시간 API
- gRPC API

## 📚 참고 자료

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Dependency Injection Pattern](https://en.wikipedia.org/wiki/Dependency_injection)
- [Repository Pattern](https://docs.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design)

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 라이센스

This project is licensed under the MIT License.

---

⭐ **이 프로젝트는 클린 아키텍처와 SOLID 원칙을 학습하고 실제 프로젝트에 적용하는 방법을 보여주는 예제입니다.**
