import { RealmRuntime, RealmMessage } from '@interrealm/realm-sdk';

const runtime = new RealmRuntime({
  realmId: 'realm-b',
  port: parseInt(process.env.PORT || '3002'),
  neighbors: [
    process.env.REALM_A_URL || 'http://localhost:3001'
  ]
});

runtime.on('ping', (message: RealmMessage) => {
  console.log(`[realm-b] Received ping from ${message.sourceRealm}`);
  console.log(`[realm-b] Payload:`, message.payload);

  setTimeout(() => {
    console.log(`[realm-b] Sending pong back to ${message.sourceRealm}`);
    runtime.send(message.sourceRealm, {
      type: 'pong',
      data: {
        originalMessage: message.id,
        timestamp: Date.now(),
        from: 'realm-b'
      }
    });
  }, 500);
});

runtime.on('pong', (message: RealmMessage) => {
  console.log(`[realm-b] Received pong from ${message.sourceRealm}`);
  console.log(`[realm-b] Response time:`, Date.now() - message.payload.data.timestamp, 'ms');
});

runtime.on('hello', (message: RealmMessage) => {
  console.log(`[realm-b] Received hello from ${message.sourceRealm}`);
  console.log(`[realm-b] Message:`, message.payload.message);

  setTimeout(() => {
    console.log(`[realm-b] Sending hello response to ${message.sourceRealm}`);
    runtime.send(message.sourceRealm, {
      type: 'hello',
      message: 'Hello back from Realm B!',
      timestamp: Date.now()
    });
  }, 1500);
});

runtime.on('default', (message: RealmMessage) => {
  console.log(`[realm-b] Received unknown message type from ${message.sourceRealm}`);
  console.log(`[realm-b] Full message:`, message);
});

runtime.start();

setTimeout(() => {
  console.log('[realm-b] Sending initial ping to realm-a');
  runtime.send('realm-a', {
    type: 'ping',
    data: {
      timestamp: Date.now(),
      from: 'realm-b'
    }
  });
}, 5000);