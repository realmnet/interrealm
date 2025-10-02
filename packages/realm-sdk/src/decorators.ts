import { RealmRuntime } from './runtime';
import { RealmMessage } from './message';

export function RealmEventListener(eventType: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (runtime: RealmRuntime) {
      runtime.on(eventType, originalMethod.bind(this));
    };

    return descriptor;
  };
}

export function RealmService(config: { realmId: string; port: number }) {
  return function (constructor: any) {
    return class extends constructor {
      runtime: RealmRuntime;

      constructor(...args: any[]) {
        super(...args);
        this.runtime = new RealmRuntime(config);
        this.registerHandlers();
      }

      registerHandlers() {
        const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(this));
        methods.forEach((method) => {
          if (typeof this[method] === 'function' && method.startsWith('handle')) {
            const eventType = method.replace('handle', '').toLowerCase();
            this.runtime.on(eventType, this[method].bind(this));
          }
        });
      }

      start() {
        this.runtime.start();
      }
    };
  };
}