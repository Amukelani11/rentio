const crypto = require('crypto');

// Use the actual data from the failing webhook
const webhookData = {
  webhookId: 'msg_32kALB3wGzhx09iXV5rKAjawVg7',
  timestamp: '1757954144',
  signature: 'v1,ViQmpCyAARQNV3jQV7ussI56Eq2YBj8ep6XUvTn40Io=',
  expectedSignature: '7oTNSTN+Gt8wpdHo5MPld7sReceIs6oueHR5mtjuJOM=',
  // This is a sample payload - we need the actual one
  payload: JSON.stringify({
    "createdDate": "2025-09-15T16:18:27.958082Z",
    "id": "evt_pL",
    "type": "payment.succeeded",
    "data": {
      "id": "pay_test_id",
      "status": "successful",
      "amount": 135125,
      "currency": "ZAR"
    }
  })
};

// Test different secret processing methods
const secret = 'whsec_MkRFOTc0NEIzMTU1N0UxMzczRDdFMzdDOTJGOUU3NDQ=';

console.log('=== YOCO SIGNATURE DEBUG ===');
console.log('Webhook ID:', webhookData.webhookId);
console.log('Timestamp:', webhookData.timestamp);
console.log('Actual signature:', webhookData.signature);
console.log('Expected signature:', webhookData.expectedSignature);

const signedContent = `${webhookData.webhookId}.${webhookData.timestamp}.${webhookData.payload}`;
console.log('Signed content length:', signedContent.length);

// Test different secret processing methods
const methods = [
  {
    name: 'Method 1: replace whsec_ and base64 decode',
    getSecretBytes: () => Buffer.from(secret.replace('whsec_', ''), 'base64')
  },
  {
    name: 'Method 2: split on _ and take [1]',
    getSecretBytes: () => Buffer.from(secret.split('_')[1] || '', 'base64')
  },
  {
    name: 'Method 3: direct base64 decode',
    getSecretBytes: () => Buffer.from(secret, 'base64')
  },
  {
    name: 'Method 4: use as utf8',
    getSecretBytes: () => Buffer.from(secret, 'utf8')
  },
  {
    name: 'Method 5: replace whsec_ and use as utf8',
    getSecretBytes: () => Buffer.from(secret.replace('whsec_', ''), 'utf8')
  }
];

for (const method of methods) {
  try {
    console.log(`\n--- ${method.name} ---`);

    const secretBytes = method.getSecretBytes();
    console.log('Secret bytes length:', secretBytes.length);

    const generatedSignature = crypto
      .createHmac('sha256', secretBytes)
      .update(signedContent)
      .digest('base64');

    console.log('Generated signature:', generatedSignature);
    console.log('Matches expected:', generatedSignature === webhookData.expectedSignature);
    console.log('Matches actual:', generatedSignature === webhookData.signature.replace('v1,', ''));

    if (generatedSignature === webhookData.expectedSignature) {
      console.log('🎉 FOUND MATCHING METHOD!');
    }
  } catch (error) {
    console.log('ERROR:', error.message);
  }
}

// Test different signed content formats
console.log('\n=== Testing different signed content formats ===');

const secretBytes = Buffer.from(secret.replace('whsec_', ''), 'base64'); // Use method 1

const contentFormats = [
  `${webhookData.webhookId}.${webhookData.timestamp}.${webhookData.payload}`,
  `${webhookData.webhookId},${webhookData.timestamp},${webhookData.payload}`,
  `${webhookData.timestamp}.${webhookData.webhookId}.${webhookData.payload}`,
  `${webhookData.payload}.${webhookData.webhookId}.${webhookData.timestamp}`,
  webhookData.payload
];

for (let i = 0; i < contentFormats.length; i++) {
  const format = contentFormats[i];
  try {
    const generatedSignature = crypto
      .createHmac('sha256', secretBytes)
      .update(format)
      .digest('base64');

    console.log(`Format ${i + 1}: ${generatedSignature === webhookData.expectedSignature ? '✅' : '❌'} ${generatedSignature.substring(0, 20)}...`);

    if (generatedSignature === webhookData.expectedSignature) {
      console.log(`🎉 MATCHING FORMAT: Format ${i + 1}`);
      console.log('Content:', format.substring(0, 100) + (format.length > 100 ? '...' : ''));
    }
  } catch (error) {
    console.log(`Format ${i + 1}: ERROR - ${error.message}`);
  }
}