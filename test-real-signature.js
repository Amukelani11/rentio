const crypto = require('crypto');

// Use the actual data from the webhook
const actualData = {
  webhookId: 'msg_32kALB3wGzhx09iXV5rKAjawVg7',
  timestamp: '1757954465',
  signature: 'v1,ijI/RaaM9VNfJyY7DpsQaYoK973e0BuUay8fwWcZWhQ=',
  payload: '{"createdDate":"2025-09-15T16:35:37.847008Z","id":"evt_M9Ee7qJa1MD0FXeTYyPu8wxD","payload":{"amount":135125,"createdDate":"2025-09-15T16:35:18.624890Z","currency":"ZAR","id":"p_2LNQWnk23bKcXRjTp4IbKpxP","metadata":{"bookingId":"62729a83-cd31-4dfa-9e5f-fc6ad61dd67b","checkoutId":"ch_dg1eBzGOpXPiXXjcX0lukYgB","domain":"06e7f58df8ad.ngrok-free.app","endDate":"2025-09-22T22:00:00.000Z","listingTitle":"drill","productType":"checkout","startDate":"2025-09-15T22:00:00.000Z","userId":"b3d85691-8ef9-462d-8688-3c3d2a26112b"},"mode":"test","paymentMethodDetails":{"card":{"expiryMonth":1,"expiryYear":29,"maskedCard":"************1111","scheme":"visa"},"type":"card"},"status":"succeeded","type":"payment"},"type":"payment.succeeded"}'
};

const secret = 'whsec_MkRFOTc0NEIzMTU1N0UxMzczRDdFMzdDOTJGOUU3NDQ=';

console.log('=== TESTING WITH REAL WEBHOOK DATA ===');
console.log('Webhook ID:', actualData.webhookId);
console.log('Timestamp:', actualData.timestamp);
console.log('Target signature:', actualData.signature.replace('v1,', ''));
console.log('Payload length:', actualData.payload.length);

// Test different methods systematically
const methods = [
  {
    name: 'Method 1: replace whsec_ and base64 decode',
    getSecret: () => Buffer.from(secret.replace('whsec_', ''), 'base64')
  },
  {
    name: 'Method 2: split on _ and take [1]',
    getSecret: () => Buffer.from(secret.split('_')[1] || '', 'base64')
  },
  {
    name: 'Method 3: direct base64 decode',
    getSecret: () => Buffer.from(secret, 'base64')
  }
];

for (const method of methods) {
  console.log(`\n--- ${method.name} ---`);

  try {
    const secretBytes = method.getSecret();
    console.log('Secret bytes length:', secretBytes.length);

    // Test with the exact payload
    const signedContent = `${actualData.webhookId}.${actualData.timestamp}.${actualData.payload}`;

    const generatedSignature = crypto
      .createHmac('sha256', secretBytes)
      .update(signedContent)
      .digest('base64');

    const targetSignature = actualData.signature.replace('v1,', '');
    const matches = generatedSignature === targetSignature;

    console.log('Generated:', generatedSignature);
    console.log('Target:   ', targetSignature);
    console.log('Match:    ', matches ? '✅ YES!' : '❌ No');

    if (matches) {
      console.log('🎉 FOUND THE CORRECT METHOD!');
      console.log('Use this method in the webhook handler');
      return method.name;
    }
  } catch (error) {
    console.log('ERROR:', error.message);
  }
}

// Test with different content variations if no match found
console.log('\n=== Testing content variations ===');

const secretBytes = Buffer.from(secret.replace('whsec_', ''), 'base64'); // Use method 1

const variations = [
  // Original
  `${actualData.webhookId}.${actualData.timestamp}.${actualData.payload}`,
  // Try normalizing JSON
  `${actualData.webhookId}.${actualData.timestamp}.${JSON.stringify(JSON.parse(actualData.payload))}`,
  // Try with different encoding
  Buffer.from(`${actualData.webhookId}.${actualData.timestamp}.${actualData.payload}`, 'utf8'),
];

for (let i = 0; i < variations.length; i++) {
  try {
    const content = variations[i];
    const generatedSignature = crypto
      .createHmac('sha256', secretBytes)
      .update(content)
      .digest('base64');

    const targetSignature = actualData.signature.replace('v1,', '');
    const matches = generatedSignature === targetSignature;

    console.log(`Variation ${i + 1}: ${matches ? '✅' : '❌'} ${generatedSignature.substring(0, 20)}...`);

    if (matches) {
      console.log('🎉 FOUND WITH VARIATION!', i + 1);
      return `Variation ${i + 1}`;
    }
  } catch (error) {
    console.log(`Variation ${i + 1}: ERROR - ${error.message}`);
  }
}

console.log('\n❌ No match found with real data');
return null;