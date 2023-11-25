# Tsebuzz - TypeScript Event Bus Library

Tsebuzz is a lightweight TypeScript library for implementing an event bus pattern. It allows different applications to communicate by emitting and listening to events.

## Features

- Simple and easy-to-use API
- Support for prioritized event listeners
- Wildcard event listeners for catching all events
- Error handling for listener invocations
- Throttling, filtering, and replaying of events
- TypeScript support

## Installation

```bash 
npm install tsebuzz
```

## Basic Usage

### Creating an Event Bus instance

```typescript
import { TypedEventBus } from 'tsebuzz';

const eventBus = new TypedEventBus();
```

### Subscribing to events

```typescript
// Subscribe to a specific event
const unsubscribe = eventBus.on('eventName', (event) =\> {
  console.log(`Event received: ${event}`);
});

// Unsubscribe when no longer needed
unsubscribe();
```

### Emitting events

```typescript
// Emit an event
eventBus.emit('eventName', eventData);
```

### Error handling
```typescript
  eventBus.setErrorHandler((error) =\> {
    console.error(`Error in event listener: ${error.message}`);
  });
```