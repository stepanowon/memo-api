const {
  createMemo,
  createMemoFromData,
  createNewMemo,
} = require("../../entities/Memo");

describe("Memo Entity", () => {
  describe("createMemo", () => {
    it("유효한 데이터로 메모를 생성해야 함", () => {
      // Given
      const title = "테스트 제목";
      const content = "테스트 내용입니다.";

      // When
      const memo = createMemo(title, content);

      // Then
      expect(memo.getId()).toBeDefined();
      expect(memo.getTitle()).toBe(title);
      expect(memo.getContent()).toBe(content);
      expect(memo.getRegdate()).toBeDefined();
      expect(typeof memo.getRegdate()).toBe("number");
    });

    it("ID와 regdate를 지정해서 메모를 생성해야 함", () => {
      // Given
      const title = "테스트 제목";
      const content = "테스트 내용입니다.";
      const id = "custom-id";
      const regdate = 1234567890;

      // When
      const memo = createMemo(title, content, id, regdate);

      // Then
      expect(memo.getId()).toBe(id);
      expect(memo.getTitle()).toBe(title);
      expect(memo.getContent()).toBe(content);
      expect(memo.getRegdate()).toBe(regdate);
    });

    it("제목이 null일 때 에러를 던져야 함", () => {
      // When & Then
      expect(() => createMemo(null, "내용")).toThrow(
        "제목은 필수 입력 항목입니다."
      );
    });

    it("제목이 undefined일 때 에러를 던져야 함", () => {
      // When & Then
      expect(() => createMemo(undefined, "내용")).toThrow(
        "제목은 필수 입력 항목입니다."
      );
    });

    it("제목이 빈 문자열일 때 에러를 던져야 함", () => {
      // When & Then
      expect(() => createMemo("", "내용")).toThrow(
        "제목은 필수 입력 항목입니다."
      );
    });

    it("제목이 문자열이 아닐 때 에러를 던져야 함", () => {
      // When & Then
      expect(() => createMemo(123, "내용")).toThrow(
        "제목은 필수 입력 항목입니다."
      );
    });

    it("내용이 null일 때 에러를 던져야 함", () => {
      // When & Then
      expect(() => createMemo("제목", null)).toThrow(
        "내용은 필수 입력 항목입니다."
      );
    });

    it("내용이 undefined일 때 에러를 던져야 함", () => {
      // When & Then
      expect(() => createMemo("제목", undefined)).toThrow(
        "내용은 필수 입력 항목입니다."
      );
    });

    it("내용이 빈 문자열일 때 에러를 던져야 함", () => {
      // When & Then
      expect(() => createMemo("제목", "")).toThrow(
        "내용은 필수 입력 항목입니다."
      );
    });

    it("내용이 문자열이 아닐 때 에러를 던져야 함", () => {
      // When & Then
      expect(() => createMemo("제목", 123)).toThrow(
        "내용은 필수 입력 항목입니다."
      );
    });

    it("제목이 200자를 초과할 때 에러를 던져야 함", () => {
      // Given
      const longTitle = "a".repeat(201);

      // When & Then
      expect(() => createMemo(longTitle, "내용")).toThrow(
        "제목은 200자를 초과할 수 없습니다."
      );
    });

    it("내용이 5000자를 초과할 때 에러를 던져야 함", () => {
      // Given
      const longContent = "a".repeat(5001);

      // When & Then
      expect(() => createMemo("제목", longContent)).toThrow(
        "내용은 5000자를 초과할 수 없습니다."
      );
    });

    it("제목과 내용을 trim 처리해야 함", () => {
      // Given
      const title = "  테스트 제목  ";
      const content = "  테스트 내용입니다.  ";

      // When
      const memo = createMemo(title, content);

      // Then
      expect(memo.getTitle()).toBe("테스트 제목");
      expect(memo.getContent()).toBe("테스트 내용입니다.");
    });

    it("최대 길이 제한 내의 제목과 내용으로 메모를 생성해야 함", () => {
      // Given
      const title = "a".repeat(200); // 정확히 200자
      const content = "a".repeat(5000); // 정확히 5000자

      // When
      const memo = createMemo(title, content);

      // Then
      expect(memo.getTitle()).toBe(title);
      expect(memo.getContent()).toBe(content);
    });
  });

  describe("도메인 메서드", () => {
    let memo;

    beforeEach(() => {
      memo = createMemo("테스트 제목", "테스트 내용입니다.");
    });

    describe("isExpired", () => {
      it("30일 이내 메모는 만료되지 않아야 함", () => {
        // When
        const result = memo.isExpired();

        // Then
        expect(result).toBe(false);
      });

      it("30일이 지난 메모는 만료되어야 함", () => {
        // Given
        const thirtyOneDaysAgo = Date.now() - 31 * 24 * 60 * 60 * 1000;
        const oldMemo = createMemo("제목", "내용", "id", thirtyOneDaysAgo);

        // When
        const result = oldMemo.isExpired();

        // Then
        expect(result).toBe(true);
      });

      it("정확히 30일 된 메모는 만료되지 않아야 함", () => {
        // Given
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const memo30Days = createMemo("제목", "내용", "id", thirtyDaysAgo);

        // When
        const result = memo30Days.isExpired();

        // Then
        expect(result).toBe(false);
      });
    });

    describe("canBeModified", () => {
      it("24시간 이내 메모는 수정 가능해야 함", () => {
        // When
        const result = memo.canBeModified();

        // Then
        expect(result).toBe(true);
      });

      it("24시간이 지난 메모는 수정 불가능해야 함", () => {
        // Given
        const twentyFiveHoursAgo = Date.now() - 25 * 60 * 60 * 1000;
        const oldMemo = createMemo("제목", "내용", "id", twentyFiveHoursAgo);

        // When
        const result = oldMemo.canBeModified();

        // Then
        expect(result).toBe(false);
      });

      it("정확히 24시간 된 메모는 수정 불가능해야 함", () => {
        // Given
        const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
        const memo24Hours = createMemo(
          "제목",
          "내용",
          "id",
          twentyFourHoursAgo
        );

        // When
        const result = memo24Hours.canBeModified();

        // Then
        expect(result).toBe(false);
      });
    });

    describe("getWordCount", () => {
      it("단어 수를 올바르게 계산해야 함", () => {
        // Given
        const memo = createMemo("제목", "이것은 테스트 내용입니다");

        // When
        const result = memo.getWordCount();

        // Then
        expect(result).toBe(3); // "이것은", "테스트", "내용입니다"를 공백으로 분리
      });

      it("단일 단어의 경우 1을 반환해야 함", () => {
        // Given
        const memo = createMemo("제목", "단어");

        // When
        const result = memo.getWordCount();

        // Then
        expect(result).toBe(1);
      });

      it("여러 공백으로 구분된 단어를 올바르게 계산해야 함", () => {
        // Given
        const memo = createMemo("제목", "단어1    단어2   단어3");

        // When
        const result = memo.getWordCount();

        // Then
        expect(result).toBe(3);
      });

      it("앞뒤 공백이 있는 내용의 단어 수를 올바르게 계산해야 함", () => {
        // Given
        const memo = createMemo("제목", "  단어1 단어2  ");

        // When
        const result = memo.getWordCount();

        // Then
        expect(result).toBe(2);
      });
    });

    describe("isTitleValid", () => {
      it("유효한 제목에 대해 true를 반환해야 함", () => {
        // When
        const result = memo.isTitleValid();

        // Then
        expect(result).toBe(true);
      });

      it("최대 길이 제목에 대해 true를 반환해야 함", () => {
        // Given
        const memo = createMemo("a".repeat(200), "내용");

        // When
        const result = memo.isTitleValid();

        // Then
        expect(result).toBe(true);
      });
    });

    describe("isContentValid", () => {
      it("유효한 내용에 대해 true를 반환해야 함", () => {
        // When
        const result = memo.isContentValid();

        // Then
        expect(result).toBe(true);
      });

      it("최대 길이 내용에 대해 true를 반환해야 함", () => {
        // Given
        const memo = createMemo("제목", "a".repeat(5000));

        // When
        const result = memo.isContentValid();

        // Then
        expect(result).toBe(true);
      });
    });

    describe("toPlainObject", () => {
      it("일반 객체로 변환해야 함", () => {
        // When
        const result = memo.toPlainObject();

        // Then
        expect(result).toEqual({
          id: memo.getId(),
          title: memo.getTitle(),
          content: memo.getContent(),
          regdate: memo.getRegdate(),
        });
      });

      it("반환된 객체가 원본과 독립적이어야 함", () => {
        // When
        const result = memo.toPlainObject();

        // Then
        expect(result).not.toBe(memo);
        expect(typeof result.getId).toBe("undefined");
      });
    });

    describe("updateContent", () => {
      it("수정 가능한 메모의 제목을 업데이트해야 함", () => {
        // Given
        const newTitle = "새로운 제목";

        // When
        const updatedMemo = memo.updateContent(newTitle, undefined);

        // Then
        expect(updatedMemo.getTitle()).toBe(newTitle);
        expect(updatedMemo.getContent()).toBe(memo.getContent());
        expect(updatedMemo.getId()).toBe(memo.getId());
        expect(updatedMemo.getRegdate()).toBe(memo.getRegdate());
      });

      it("수정 가능한 메모의 내용을 업데이트해야 함", () => {
        // Given
        const newContent = "새로운 내용입니다.";

        // When
        const updatedMemo = memo.updateContent(undefined, newContent);

        // Then
        expect(updatedMemo.getTitle()).toBe(memo.getTitle());
        expect(updatedMemo.getContent()).toBe(newContent);
        expect(updatedMemo.getId()).toBe(memo.getId());
        expect(updatedMemo.getRegdate()).toBe(memo.getRegdate());
      });

      it("수정 가능한 메모의 제목과 내용을 모두 업데이트해야 함", () => {
        // Given
        const newTitle = "새로운 제목";
        const newContent = "새로운 내용입니다.";

        // When
        const updatedMemo = memo.updateContent(newTitle, newContent);

        // Then
        expect(updatedMemo.getTitle()).toBe(newTitle);
        expect(updatedMemo.getContent()).toBe(newContent);
        expect(updatedMemo.getId()).toBe(memo.getId());
        expect(updatedMemo.getRegdate()).toBe(memo.getRegdate());
      });

      it("수정 불가능한 메모 업데이트 시 에러를 던져야 함", () => {
        // Given
        const twentyFiveHoursAgo = Date.now() - 25 * 60 * 60 * 1000;
        const oldMemo = createMemo("제목", "내용", "id", twentyFiveHoursAgo);

        // When & Then
        expect(() => oldMemo.updateContent("새 제목", "새 내용")).toThrow(
          "생성 후 24시간이 지난 메모는 수정할 수 없습니다."
        );
      });

      it("null 제목으로 업데이트 시 기존 제목을 유지해야 함", () => {
        // Given
        const newContent = "새로운 내용";

        // When
        const updatedMemo = memo.updateContent(null, newContent);

        // Then
        expect(updatedMemo.getTitle()).toBe(memo.getTitle());
        expect(updatedMemo.getContent()).toBe(newContent);
      });

      it("null 내용으로 업데이트 시 기존 내용을 유지해야 함", () => {
        // Given
        const newTitle = "새로운 제목";

        // When
        const updatedMemo = memo.updateContent(newTitle, null);

        // Then
        expect(updatedMemo.getTitle()).toBe(newTitle);
        expect(updatedMemo.getContent()).toBe(memo.getContent());
      });
    });
  });

  describe("팩토리 함수", () => {
    describe("createMemoFromData", () => {
      it("데이터 객체로부터 메모를 생성해야 함", () => {
        // Given
        const data = {
          id: "test-id",
          title: "테스트 제목",
          content: "테스트 내용",
          regdate: 1234567890,
        };

        // When
        const memo = createMemoFromData(data);

        // Then
        expect(memo.getId()).toBe(data.id);
        expect(memo.getTitle()).toBe(data.title);
        expect(memo.getContent()).toBe(data.content);
        expect(memo.getRegdate()).toBe(data.regdate);
      });

      it("일부 필드가 누락된 데이터로도 메모를 생성해야 함", () => {
        // Given
        const data = {
          title: "테스트 제목",
          content: "테스트 내용",
        };

        // When
        const memo = createMemoFromData(data);

        // Then
        expect(memo.getId()).toBeDefined();
        expect(memo.getTitle()).toBe(data.title);
        expect(memo.getContent()).toBe(data.content);
        expect(memo.getRegdate()).toBeDefined();
      });

      it("잘못된 데이터로 메모 생성 시 에러를 던져야 함", () => {
        // Given
        const invalidData = {
          title: null,
          content: "테스트 내용",
        };

        // When & Then
        expect(() => createMemoFromData(invalidData)).toThrow(
          "제목은 필수 입력 항목입니다."
        );
      });
    });

    describe("createNewMemo", () => {
      it("새로운 메모를 생성해야 함", () => {
        // Given
        const title = "새 메모 제목";
        const content = "새 메모 내용";

        // When
        const memo = createNewMemo(title, content);

        // Then
        expect(memo.getId()).toBeDefined();
        expect(memo.getTitle()).toBe(title);
        expect(memo.getContent()).toBe(content);
        expect(memo.getRegdate()).toBeDefined();
        expect(typeof memo.getRegdate()).toBe("number");
      });

      it("createMemo와 동일한 결과를 반환해야 함", () => {
        // Given
        const title = "테스트 제목";
        const content = "테스트 내용";

        // When
        const memo1 = createNewMemo(title, content);
        const memo2 = createMemo(title, content);

        // Then
        expect(memo1.getTitle()).toBe(memo2.getTitle());
        expect(memo1.getContent()).toBe(memo2.getContent());
        // ID와 regdate는 다를 수 있음
      });

      it("잘못된 데이터로 메모 생성 시 에러를 던져야 함", () => {
        // When & Then
        expect(() => createNewMemo("", "내용")).toThrow(
          "제목은 필수 입력 항목입니다."
        );
      });
    });
  });

  describe("edge cases", () => {
    it("매우 긴 유효한 제목과 내용으로 메모를 생성해야 함", () => {
      // Given
      const longTitle = "a".repeat(200);
      const longContent = "b".repeat(5000);

      // When
      const memo = createMemo(longTitle, longContent);

      // Then
      expect(memo.getTitle()).toBe(longTitle);
      expect(memo.getContent()).toBe(longContent);
      expect(memo.isTitleValid()).toBe(true);
      expect(memo.isContentValid()).toBe(true);
    });

    it("공백만 있는 제목과 내용은 에러를 던져야 함", () => {
      // Given
      const spaceTitle = "   ";
      const spaceContent = "   ";

      // When & Then
      expect(() => createMemo(spaceTitle, "내용")).toThrow(
        "제목은 필수 입력 항목입니다."
      );
      expect(() => createMemo("제목", spaceContent)).toThrow(
        "내용은 필수 입력 항목입니다."
      );
    });

    it("특수문자가 포함된 제목과 내용으로 메모를 생성해야 함", () => {
      // Given
      const specialTitle = "제목!@#$%^&*()";
      const specialContent = "내용<>?:{}|[]\\";

      // When
      const memo = createMemo(specialTitle, specialContent);

      // Then
      expect(memo.getTitle()).toBe(specialTitle);
      expect(memo.getContent()).toBe(specialContent);
    });

    it("유니코드 문자가 포함된 제목과 내용으로 메모를 생성해야 함", () => {
      // Given
      const unicodeTitle = "제목 🚀 테스트";
      const unicodeContent = "내용 ✨ 이모지 포함";

      // When
      const memo = createMemo(unicodeTitle, unicodeContent);

      // Then
      expect(memo.getTitle()).toBe(unicodeTitle);
      expect(memo.getContent()).toBe(unicodeContent);
    });
  });
});
