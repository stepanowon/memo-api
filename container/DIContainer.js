const createDIContainer = () => {
  const dependencies = new Map();
  const singletons = new Map();

  // 의존성 등록 (팩토리 함수 방식)
  const register = (name, factory, options = {}) => {
    dependencies.set(name, {
      factory,
      singleton: options.singleton || false,
    });
  };

  // 의존성 해결
  const resolve = (name) => {
    const dependency = dependencies.get(name);

    if (!dependency) {
      throw new Error(`의존성 '${name}'을 찾을 수 없습니다.`);
    }

    // 싱글톤인 경우 캐시된 인스턴스 반환
    if (dependency.singleton) {
      if (singletons.has(name)) {
        return singletons.get(name);
      }

      const instance = dependency.factory(containerInstance);
      singletons.set(name, instance);
      return instance;
    }

    // 매번 새 인스턴스 생성
    return dependency.factory(containerInstance);
  };

  // 모든 의존성이 등록되었는지 확인
  const validateDependencies = () => {
    const registeredNames = Array.from(dependencies.keys());
    console.log("등록된 의존성:", registeredNames);
    return registeredNames.length > 0;
  };

  // 컨테이너 초기화
  const clear = () => {
    dependencies.clear();
    singletons.clear();
  };

  const containerInstance = {
    register,
    resolve,
    validateDependencies,
    clear,
  };

  return containerInstance;
};

module.exports = createDIContainer;
