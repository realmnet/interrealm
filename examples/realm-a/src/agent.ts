import { RealmRuntime, RealmMessage } from '@interrealm/realm-sdk';

const runtime = new RealmRuntime({
  realmId: 'realm-a',
  port: parseInt(process.env.PORT || '3001'),
  neighbors: [
    process.env.REALM_B_URL || 'http://localhost:3002'
  ]
});

runtime.on('ping', (message: RealmMessage) => {
  console.log(`[realm-a] Received ping from ${message.sourceRealm}`);
  console.log(`[realm-a] Payload:`, message.payload);

  setTimeout(() => {
    console.log(`[realm-a] Sending pong back to ${message.sourceRealm}`);
    runtime.send(message.sourceRealm, {
      type: 'pong',
      data: {
        originalMessage: message.id,
        timestamp: Date.now(),
        from: 'realm-a'
      }
    });
  }, 1000);
});

runtime.on('hello', (message: RealmMessage) => {
  console.log(`[realm-a] Received hello from ${message.sourceRealm}`);
  console.log(`[realm-a] Message:`, message.payload.message);
});

runtime.on('default', (message: RealmMessage) => {
  console.log(`[realm-a] Received unknown message type from ${message.sourceRealm}`);
  console.log(`[realm-a] Full message:`, message);
});

runtime.start();

setTimeout(() => {
  console.log('[realm-a] Sending initial hello to realm-b');
  runtime.send('realm-b', {
    type: 'hello',
    message: 'Hello from Realm A!',
    timestamp: Date.now()
  });
}, 2000);

setInterval(() => {
  console.log('[realm-a] Sending ping to realm-b');
  runtime.send('realm-b', {
    type: 'ping',
    data: {
      timestamp: Date.now(),
      from: 'realm-a'
    }
  });
}, 10000);