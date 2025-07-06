// 테스트용 목 서비스들
const createMockMemoReadService = () => ({
  getAllMemos: jest.fn(),
  getMemoById: jest.fn(),
  getMemoExists: jest.fn(),
});

const createMockMemoWriteService = () => ({
  createMemo: jest.fn(),
  updateMemo: jest.fn(),
  deleteMemo: jest.fn(),
});

const createMockMemoValidationService = () => ({
  validateCreateMemo: jest.fn(),
  validateUpdateMemo: jest.fn(),
  validatePagination: jest.fn(),
  validateMemoId: jest.fn(),
});

// 테스트용 목 컨테이너
const createMockContainer = () => {
  const services = {
    memoReadService: createMockMemoReadService(),
    memoWriteService: createMockMemoWriteService(),
    memoValidationService: createMockMemoValidationService(),
  };

  return {
    resolve: jest.fn((serviceName) => services[serviceName]),
    services, // 테스트에서 직접 접근할 수 있도록
  };
};

// 목 서비스 초기화 (각 테스트 전에 호출)
const resetMockServices = (container) => {
  Object.values(container.services).forEach((service) => {
    Object.values(service).forEach((method) => {
      if (jest.isMockFunction(method)) {
        method.mockReset();
      }
    });
  });

  container.resolve.mockReset();

  // resolve 메서드 재설정
  container.resolve.mockImplementation(
    (serviceName) => container.services[serviceName]
  );
};

// 기본 성공 응답 설정
const setupSuccessfulMocks = (container, testData = {}) => {
  const { memoReadService, memoWriteService, memoValidationService } =
    container.services;

  // 기본 검증 성공 설정
  memoValidationService.validateCreateMemo.mockReturnValue({
    isValid: true,
    errors: [],
  });
  memoValidationService.validateUpdateMemo.mockReturnValue({
    isValid: true,
    errors: [],
  });
  memoValidationService.validatePagination.mockReturnValue({
    isValid: true,
    errors: [],
    page: 1,
    pageSize: 10,
  });
  memoValidationService.validateMemoId.mockReturnValue({
    isValid: true,
    errors: [],
  });

  // 기본 데이터 설정
  if (testData.memos) {
    memoReadService.getAllMemos.mockResolvedValue(testData.memos);
  }

  if (testData.memo) {
    memoReadService.getMemoById.mockResolvedValue(testData.memo);
    memoWriteService.createMemo.mockResolvedValue(testData.memo);
    memoWriteService.updateMemo.mockResolvedValue(testData.memo);
  }

  memoWriteService.deleteMemo.mockResolvedValue(true);
};

// 에러 응답 설정
const setupErrorMocks = (container, errorType = "validation") => {
  const { memoReadService, memoWriteService, memoValidationService } =
    container.services;

  switch (errorType) {
    case "validation":
      memoValidationService.validateCreateMemo.mockReturnValue({
        isValid: false,
        errors: ["입력 데이터가 유효하지 않습니다."],
      });
      memoValidationService.validateUpdateMemo.mockReturnValue({
        isValid: false,
        errors: ["입력 데이터가 유효하지 않습니다."],
      });
      memoValidationService.validatePagination.mockReturnValue({
        isValid: false,
        errors: ["페이징 파라미터가 유효하지 않습니다."],
      });
      break;

    case "notFound":
      memoReadService.getMemoById.mockResolvedValue(null);
      memoWriteService.updateMemo.mockResolvedValue(null);
      break;

    case "serverError":
      const error = new Error("서버 내부 오류");
      memoReadService.getAllMemos.mockRejectedValue(error);
      memoReadService.getMemoById.mockRejectedValue(error);
      memoWriteService.createMemo.mockRejectedValue(error);
      memoWriteService.updateMemo.mockRejectedValue(error);
      memoWriteService.deleteMemo.mockRejectedValue(error);
      break;
  }
};

module.exports = {
  createMockContainer,
  resetMockServices,
  setupSuccessfulMocks,
  setupErrorMocks,
};
