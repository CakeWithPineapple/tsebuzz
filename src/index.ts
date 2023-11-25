type Listener<T> = (event: T) => void;
type ErrorListener = (error: Error) => void;
type EventFilter<T> = (event: T) => boolean;
type EventMetadata = Record<string, any>;

interface Unsubscribe {
    (): void;
}

export class TypedEventBus {
  private static instance: TypedEventBus;

  private listeners: Record<string, Listener<any>[]> = {};
  private wildcardListeners: Listener<any>[] = [];
  private eventPriorities: Record<string, number> = {};
  private errorListeners: ErrorListener[] = [];
  private eventHistory: Record<string, unknown[]> = {};
  private debouncedEvents: Record<string, number> = {};

  private constructor() {
    
  };

  static getInstance(): TypedEventBus {
    if (!TypedEventBus.instance) {
      TypedEventBus.instance = new TypedEventBus();
    }
    return TypedEventBus.instance;
  }

  on<T>(eventName: string, listener: Listener<T>, priority: number = 0): Unsubscribe {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }

    // Insert listener based on priority
    const index = this.listeners[eventName].findIndex((l) => this.eventPriorities[l.toString()] > priority);
    if (index === -1) {
      this.listeners[eventName].push(listener);
    } else {
      this.listeners[eventName].splice(index, 0, listener);
    }

    return () => {
      this.listeners[eventName] = this.listeners[eventName].filter((l) => l !== listener);
    };
  }

  off<T>(eventName: string, listener: Listener<T>): void {
    const specificListeners = this.listeners[eventName] || [];
    this.listeners[eventName] = specificListeners.filter((l) => l !== listener);
  }

  once<T>(eventName: string, listener: Listener<T>, priority: number = 0): Unsubscribe {
    const unsubscribe = () => {
      this.listeners[eventName] = this.listeners[eventName].filter((l) => l !== onceListener);
    };

    const onceListener: Listener<T> = (event) => {
      listener(event);
      unsubscribe();
    };

    this.on(eventName, onceListener, priority);

    return unsubscribe;
  }

  onWildcard<T>(listener: Listener<T>): Unsubscribe {
    this.wildcardListeners.push(listener);

    return () => {
      this.wildcardListeners = this.wildcardListeners.filter((l) => l !== listener);
    };
  }

  emit<T>(eventName: string, event: T): void {
    // Emit for specific event listeners
    const eventListeners = this.listeners[eventName];
    if (eventListeners) {
      eventListeners.slice().forEach((listener) => this.safeInvoke(listener, event));
    }

    // Emit for wildcard event listeners
    this.wildcardListeners.slice().forEach((listener) => this.safeInvoke(listener, event));
  }

  setErrorHandler(errorListener: ErrorListener): void {
    this.errorListeners.push(errorListener);
  }

  private safeInvoke<T>(listener: Listener<T>, event: T): void {
    try {
        listener(event);
    } catch (error) {
        if (event === undefined || event === null) {
        // Ignore the error for undefined or null payloads
        } else {
        this.handleError(error as Error);
        }
    }
  }   


  private handleError(error: Error): void {
    this.errorListeners.forEach((listener) => listener(error));
  }

  getListenerCount(eventName: string): number {
    const specificListeners = this.listeners[eventName] || [];
    const wildcardListeners = this.wildcardListeners || [];
    return specificListeners.length + wildcardListeners.length;
  }

  filter<T>(eventName: string, listener: Listener<T>, filter: EventFilter<T>): Unsubscribe {
    const filteredListener: Listener<T> = (event) => {
        if (filter(event)) {
            listener(event);
        }
    };

    return this.on(eventName, filteredListener);
  }

  throttle<T>(eventName: string, listener: Listener<T>, throttleTime: number): Unsubscribe {
    let lastInvokeTime = 0;

    const throttledListener: Listener<T> = (event) => {
        const now = Date.now();
        if (now - lastInvokeTime >= throttleTime) {
            listener(event);
            lastInvokeTime = now;
        }
    };

    return this.on(eventName, throttledListener);
  }

  replay<T>(eventName: string, listener: Listener<T>): Unsubscribe {
    const pastEvents = this.eventHistory[eventName] || [];
    pastEvents.forEach((event) => listener(event as T));

    return this.on(eventName, listener);
  }

  onceWithTimeout<T>(eventName: string, listener: Listener<T>, timeout: number): Unsubscribe {
    let timeoutId: number | undefined;

    const unsubscribe = this.once(eventName, (event: T) => {
        if (timeout !== undefined) {
            clearTimeout(timeoutId);
        }
        listener(event);
    });
    
    timeoutId = setTimeout(() => {
        unsubscribe();
    }, timeout) as any; // Cast to 'any' to handle the potential stepMismatch
    
    return unsubscribe;
  }

  emitWithHistory<T>(eventName: string, event: T): void {
    this.emit(eventName, event);

    // Save event to history
    if (!this.eventHistory[eventName]) {
        this.eventHistory[eventName] = [];
    }
    this.eventHistory[eventName].push(event);
  }

  unsubscribe<T>(eventName: string, listener: Listener<T>): void {
    const listeners = this.listeners[eventName];
    if (listeners) {
        this.listeners[eventName] = listeners.filter((l) => l !== listener);
    }
  }

  removeAllListeners(eventName?: string): void {
    if (eventName) {
      delete this.listeners[eventName];
    } else {
      this.listeners = {} as Record<string, Listener<any>[]>;
      this.wildcardListeners = [] as Listener<any>[];
    }
  }

  clear(): void {
    this.listeners = {};
    this.wildcardListeners = [];
    this.eventPriorities = {};
    this.errorListeners = [];
  }
}