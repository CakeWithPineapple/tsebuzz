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

  test('should emit and listen to a specific event', () => {
    const listener = jest.fn();

    // Subscribe to the 'testEvent' event
    eventBus.on('testEvent', listener);

    // Emit the 'testEvent' event
    eventBus.emit<TestEvent>('testEvent', { message: 'Hello, World!' });

    // Expect the listener to have been called with the correct event
    expect(listener).toHaveBeenCalledWith({ message: 'Hello, World!' });
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
