// Request DTOs
const createMemoRequestDto = (title, content) => {
  return {
    title: title?.toString().trim() || "",
    content: content?.toString().trim() || "",
  };
};

const updateMemoRequestDto = (title, content) => {
  const dto = {};
  if (title !== undefined) {
    dto.title = title?.toString().trim() || "";
  }
  if (content !== undefined) {
    dto.content = content?.toString().trim() || "";
  }
  return dto;
};

const paginationRequestDto = (page, pageSize) => {
  const parsedPage = parseInt(page);
  const parsedPageSize = parseInt(pageSize);

  return {
    page: parsedPage > 0 ? parsedPage : 1,
    pageSize: parsedPageSize > 0 ? parsedPageSize : 10,
  };
};

// Response DTOs
const memoResponseDto = (memo) => {
  if (!memo) return null;

  return {
    id: memo.getId ? memo.getId() : memo.id,
    title: memo.getTitle ? memo.getTitle() : memo.title,
    content: memo.getContent ? memo.getContent() : memo.content,
    regdate: memo.getRegdate ? memo.getRegdate() : memo.regdate,
  };
};

const successResponseDto = (message, item) => {
  return {
    isSuccess: true,
    message,
    item,
  };
};

const errorResponseDto = (message, errors = []) => {
  return {
    isSuccess: false,
    message,
    errors: Array.isArray(errors) ? errors : [errors],
  };
};

const paginatedResponseDto = (items, page, pageSize, totalCount) => {
  const totalPages = Math.ceil(totalCount / pageSize);
  const hasNext = page < totalPages;
  const hasPrevious = page > 1;

  return {
    isSuccess: true,
    items,
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages,
      hasNext,
      hasPrevious,
    },
  };
};

module.exports = {
  // Request DTOs
  createMemoRequestDto,
  updateMemoRequestDto,
  paginationRequestDto,

  // Response DTOs
  memoResponseDto,
  successResponseDto,
  errorResponseDto,
  paginatedResponseDto,
};
