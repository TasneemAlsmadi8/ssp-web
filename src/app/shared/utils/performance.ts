export function MeasureRuntime(message: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    let callCount = 0;
    let totalTime = 0;

    descriptor.value = async function (...args: any[]) {
      callCount++;
      const start = performance.now();

      let result;
      if (originalMethod.constructor.name === 'AsyncFunction') {
        result = await originalMethod.apply(this, args);
      } else {
        result = originalMethod.apply(this, args);
      }

      const end = performance.now();
      const executionTime = end - start;
      totalTime += executionTime;

      console.log(
        `${message} - Execution time for ${propertyKey}: ${executionTime.toFixed(
          2
        )} ms`
      );
      console.log(`${propertyKey} has been called ${callCount} times.`);
      console.log(
        `Total execution time for ${propertyKey}: ${totalTime.toFixed(2)} ms`
      );
      console.log(`object class: ${this.constructor.name}`);

      return result;
    };

    return descriptor;
  };
}

type ExecutionRecord = {
  totalRuntime: number;
  callCount: number;
};

const executionRecords: Record<string, ExecutionRecord> = {};

export function measureCodeRuntime<T>(
  name: string,
  code: () => T
): T extends Promise<any> ? Promise<any> : T {
  const start = performance.now();

  const result = code();
  if (result instanceof Promise) {
    return result.then((res: any) => {
      const end = performance.now();
      const executionTime = end - start;
      recordExecution(name, executionTime);
      return res;
    }) as T extends Promise<any> ? Promise<any> : T;
  } else {
    const end = performance.now();
    const executionTime = end - start;
    recordExecution(name, executionTime);
    return result as T extends Promise<any> ? Promise<any> : T;
  }
}

function recordExecution(name: string, executionTime: number) {
  if (!executionRecords[name]) {
    executionRecords[name] = {
      totalRuntime: 0,
      callCount: 0,
    };
  }
  executionRecords[name].totalRuntime += executionTime;
  executionRecords[name].callCount++;

  console.log(`${name} - Execution time: ${executionTime.toFixed(2)} ms`);
  console.log(
    `${name} - Total execution time: ${executionRecords[
      name
    ].totalRuntime.toFixed(2)} ms`
  );
  console.log(`${name} - Number of calls: ${executionRecords[name].callCount}`);
}
