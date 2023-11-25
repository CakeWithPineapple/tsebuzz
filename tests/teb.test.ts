import { TypedEventBus } from '../src';

// Define events for testing
interface TestEvent {
  message: string;
}

describe('TypedEventBus', () => {
  let eventBus: TypedEventBus;

  beforeEach(() => {
    // Create a new instance of TypedEventBus before each test
    eventBus = TypedEventBus.getInstance();
  });

  afterEach(() => {
    // Clear event listeners and reset state after each test
    eventBus.clear();
  });


  test('should unsubscribe from a specific event', () => {
    const listener = jest.fn();

    // Subscribe to the 'testEvent' event
    const unsubscribe = eventBus.on('testEvent', listener);

    // Unsubscribe from the 'testEvent' event
    unsubscribe();

    // Emit the 'testEvent' event
    eventBus.emit<TestEvent>('testEvent', { message: 'Hello, World!' });

    // Expect the listener not to have been called
    expect(listener).not.toHaveBeenCalled();
  });

  // Add more test cases as needed for other features of TypedEventBus
});

describe('Load Test', () => {
  let eventBus: TypedEventBus;

  beforeEach(() => {
    eventBus = TypedEventBus.getInstance();
  });

  afterEach(() => {
    eventBus.clear();
  });

  test('should handle a large number of events', async () => {
    const listener = jest.fn();

    // Subscribe to the 'testEvent' event
    eventBus.on('testEvent' ,listener);

    const numberOfEvents = 300;

    for (let i = 0; i < numberOfEvents; i++) {
      eventBus.emit<TestEvent>('testEvent', { message: `Event ${i}` });
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));

    expect(listener.mock.calls.length).toBe(numberOfEvents);

    listener.mock.calls.forEach((call, index) => {
      expect(call[0]).toEqual({ message: `Event ${index}` })
    })
  })
});




describe('One emitter, two listeners', () => {
  let eventBus: TypedEventBus;

  beforeEach(() => {
    // Create a new instance of TypedEventBus before each test
    eventBus = TypedEventBus.getInstance();
  });

  afterEach(() => {
    // Clear event listeners and reset state after each test
    eventBus.clear();
  });

  test('should emit once and have two listeners to one specific event', () => {
    const listener = jest.fn();
    const listener2 = jest.fn();

    // Subscribe to the 'testEvent' event
    eventBus.on('testEvent', listener);
    eventBus.on('testEvent', listener2);

    // Emit the 'testEvent' event
    eventBus.emit<TestEvent>('testEvent', { message: 'Hello, World!' });

    // Expect the listener to have been called with the correct event
    expect(listener).toHaveBeenCalledWith({ message: 'Hello, World!' });
    expect(listener2).toHaveBeenCalledWith({ message: 'Hello, World!' });
  
  });
});



describe('One emitter, two listeners, of which one is wildcard', () => {
  let eventBus: TypedEventBus;

  beforeEach(() => {
    // Create a new instance of TypedEventBus before each test
    eventBus = TypedEventBus.getInstance();
  });

  afterEach(() => {
    // Clear event listeners and reset state after each test
    eventBus.clear();
  });

  test('should emit and have two listeners of which one is wildcard', () => {
    const listener = jest.fn();
    const listener2 = jest.fn();

    // Subscribe to the 'testEvent' event
    eventBus.on('testEvent', listener);
    eventBus.onWildcard(listener2);

    // Emit the 'testEvent' event
    eventBus.emit<TestEvent>('Event', { message: 'Hello, World!' });

    // Expect the listener to have been called with the correct event
    expect(listener.mock.calls.length).toBe(0);
    expect(listener2).toHaveBeenCalledWith({ message: 'Hello, World!' });
  
  });
});



describe('Replay', () => {
  let eventBus: TypedEventBus;

  beforeEach(() => {
    // Create a new instance of TypedEventBus before each test
    eventBus = TypedEventBus.getInstance();
  });

  afterEach(() => {
    // Clear event listeners and reset state after each test
    eventBus.clear();
  });

  test('should resend all send message', () => {
    const listener = jest.fn();
    const listener2 = jest.fn();
  
    eventBus.on('testEvent', listener2);

    // Emit the 'testEvent' event
    eventBus.emitWithHistory<TestEvent>('testEvent', { message: 'Hello, World!' });
    eventBus.emitWithHistory<TestEvent>('testEvent', { message: 'Hello, World!' });
    eventBus.emitWithHistory<TestEvent>('testEvent', { message: 'Hello, World!' });


    // Subscribe to the 'testEvent' event
    eventBus.replay('testEvent', listener);
    

    // Expect the listener to have been called with the correct event
    expect(listener.mock.calls.length).toBe(3);
    expect(listener2.mock.calls.length).toBe(3);
    
  
  });
});






