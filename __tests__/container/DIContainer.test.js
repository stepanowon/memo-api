const createDIContainer = require("../../container/DIContainer");

describe("DIContainer", () => {
  let container;

  beforeEach(() => {
    container = createDIContainer();
  });

  describe("register", () => {
    it("의존성을 성공적으로 등록해야 함", () => {
      // Given
      const factory = () => ({ name: "TestService" });

      // When
      container.register("testService", factory);

      // Then
      expect(() => container.resolve("testService")).not.toThrow();
    });

    it("싱글톤 옵션으로 의존성을 등록해야 함", () => {
      // Given
      const factory = () => ({ name: "SingletonService" });

      // When
      container.register("singletonService", factory, { singleton: true });

      // Then
      expect(() => container.resolve("singletonService")).not.toThrow();
    });

    it("같은 이름으로 여러 번 등록하면 마지막 등록이 유효해야 함", () => {
      // Given
      const factory1 = () => ({ name: "Service1" });
      const factory2 = () => ({ name: "Service2" });

      // When
      container.register("testService", factory1);
      container.register("testService", factory2);

      // Then
      const result = container.resolve("testService");
      expect(result.name).toBe("Service2");
    });
  });

  describe("resolve", () => {
    it("등록된 의존성을 성공적으로 해결해야 함", () => {
      // Given
      const factory = () => ({ name: "TestService", value: 42 });
      container.register("testService", factory);

      // When
      const result = container.resolve("testService");

      // Then
      expect(result).toEqual({ name: "TestService", value: 42 });
    });

    it("등록되지 않은 의존성에 대해 에러를 발생시켜야 함", () => {
      // When & Then
      expect(() => container.resolve("nonExistentService")).toThrow(
        "의존성 'nonExistentService'을 찾을 수 없습니다."
      );
    });

    it("팩토리 함수에 컨테이너 인스턴스를 전달해야 함", () => {
      // Given
      let receivedContainer;
      const factory = (containerInstance) => {
        receivedContainer = containerInstance;
        return { name: "TestService" };
      };
      container.register("testService", factory);

      // When
      container.resolve("testService");

      // Then
      expect(receivedContainer).toBe(container);
    });

    it("의존성 주입을 통해 다른 서비스를 사용할 수 있어야 함", () => {
      // Given
      container.register("repository", () => ({ getData: () => "data" }));
      container.register("service", (container) => {
        const repository = container.resolve("repository");
        return {
          processData: () => `processed: ${repository.getData()}`,
        };
      });

      // When
      const service = container.resolve("service");

      // Then
      expect(service.processData()).toBe("processed: data");
    });
  });

  describe("singleton behavior", () => {
    it("싱글톤으로 등록된 의존성은 같은 인스턴스를 반환해야 함", () => {
      // Given
      let instanceCount = 0;
      const factory = () => {
        instanceCount++;
        return { id: instanceCount, name: "SingletonService" };
      };
      container.register("singletonService", factory, { singleton: true });

      // When
      const instance1 = container.resolve("singletonService");
      const instance2 = container.resolve("singletonService");

      // Then
      expect(instance1).toBe(instance2);
      expect(instance1.id).toBe(1);
      expect(instanceCount).toBe(1);
    });

    it("싱글톤이 아닌 의존성은 매번 새 인스턴스를 반환해야 함", () => {
      // Given
      let instanceCount = 0;
      const factory = () => {
        instanceCount++;
        return { id: instanceCount, name: "TransientService" };
      };
      container.register("transientService", factory, { singleton: false });

      // When
      const instance1 = container.resolve("transientService");
      const instance2 = container.resolve("transientService");

      // Then
      expect(instance1).not.toBe(instance2);
      expect(instance1.id).toBe(1);
      expect(instance2.id).toBe(2);
      expect(instanceCount).toBe(2);
    });

    it("기본값은 싱글톤이 아니어야 함", () => {
      // Given
      let instanceCount = 0;
      const factory = () => {
        instanceCount++;
        return { id: instanceCount, name: "DefaultService" };
      };
      container.register("defaultService", factory); // 옵션 없음

      // When
      const instance1 = container.resolve("defaultService");
      const instance2 = container.resolve("defaultService");

      // Then
      expect(instance1).not.toBe(instance2);
      expect(instanceCount).toBe(2);
    });
  });

  describe("validateDependencies", () => {
    it("의존성이 등록되어 있으면 true를 반환해야 함", () => {
      // Given
      container.register("testService", () => ({ name: "TestService" }));

      // When
      const result = container.validateDependencies();

      // Then
      expect(result).toBe(true);
    });

    it("의존성이 등록되어 있지 않으면 false를 반환해야 함", () => {
      // When
      const result = container.validateDependencies();

      // Then
      expect(result).toBe(false);
    });

    it("여러 의존성이 등록되어 있으면 true를 반환해야 함", () => {
      // Given
      container.register("service1", () => ({ name: "Service1" }));
      container.register("service2", () => ({ name: "Service2" }));

      // When
      const result = container.validateDependencies();

      // Then
      expect(result).toBe(true);
    });
  });

  describe("clear", () => {
    it("모든 의존성과 싱글톤 인스턴스를 제거해야 함", () => {
      // Given
      container.register("service1", () => ({ name: "Service1" }));
      container.register("service2", () => ({ name: "Service2" }), {
        singleton: true,
      });
      container.resolve("service2"); // 싱글톤 인스턴스 생성

      // When
      container.clear();

      // Then
      expect(() => container.resolve("service1")).toThrow();
      expect(() => container.resolve("service2")).toThrow();
      expect(container.validateDependencies()).toBe(false);
    });

    it("clear 후에 새로운 의존성을 등록할 수 있어야 함", () => {
      // Given
      container.register("oldService", () => ({ name: "OldService" }));
      container.clear();

      // When
      container.register("newService", () => ({ name: "NewService" }));

      // Then
      const result = container.resolve("newService");
      expect(result.name).toBe("NewService");
    });

    it("clear 후 싱글톤 인스턴스가 새로 생성되어야 함", () => {
      // Given
      let instanceCount = 0;
      const factory = () => {
        instanceCount++;
        return { id: instanceCount, name: "SingletonService" };
      };
      container.register("singletonService", factory, { singleton: true });
      const instance1 = container.resolve("singletonService");

      // When
      container.clear();
      container.register("singletonService", factory, { singleton: true });
      const instance2 = container.resolve("singletonService");

      // Then
      expect(instance1).not.toBe(instance2);
      expect(instance1.id).toBe(1);
      expect(instance2.id).toBe(2);
    });
  });

  describe("complex dependency scenarios", () => {
    it("순환 의존성 시나리오를 처리해야 함", () => {
      // Given
      container.register("serviceA", (container) => {
        return {
          name: "ServiceA",
          getServiceB: () => container.resolve("serviceB"),
        };
      });

      container.register("serviceB", (container) => {
        return {
          name: "ServiceB",
          getServiceA: () => container.resolve("serviceA"),
        };
      });

      // When & Then
      // 순환 의존성이 있지만 lazy loading으로 해결 가능
      const serviceA = container.resolve("serviceA");
      expect(serviceA.name).toBe("ServiceA");
      expect(serviceA.getServiceB().name).toBe("ServiceB");
    });

    it("깊은 의존성 체인을 처리해야 함", () => {
      // Given
      container.register("repository", () => ({ getData: () => "raw data" }));

      container.register("dataService", (container) => {
        const repository = container.resolve("repository");
        return {
          processData: () => `processed: ${repository.getData()}`,
        };
      });

      container.register("businessService", (container) => {
        const dataService = container.resolve("dataService");
        return {
          handleRequest: () => `handled: ${dataService.processData()}`,
        };
      });

      container.register("controller", (container) => {
        const businessService = container.resolve("businessService");
        return {
          respond: () => `response: ${businessService.handleRequest()}`,
        };
      });

      // When
      const controller = container.resolve("controller");

      // Then
      expect(controller.respond()).toBe(
        "response: handled: processed: raw data"
      );
    });

    it("팩토리 함수에서 에러가 발생하면 전파되어야 함", () => {
      // Given
      const factory = () => {
        throw new Error("Factory error");
      };
      container.register("errorService", factory);

      // When & Then
      expect(() => container.resolve("errorService")).toThrow("Factory error");
    });
  });
});
