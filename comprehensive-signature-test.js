const crypto = require('crypto');

// Try to reverse engineer the signature by testing multiple combinations
function testSignatureGeneration(webhookData, secret) {
  console.log('=== COMPREHENSIVE SIGNATURE TEST ===');

  // Try every possible combination
  const secretMethods = [
    () => Buffer.from(secret, 'utf8'),
    () => Buffer.from(secret.replace('whsec_', ''), 'utf8'),
    () => Buffer.from(secret, 'base64'),
    () => Buffer.from(secret.replace('whsec_', ''), 'base64'),
    () => Buffer.from(secret.split('_')[1] || '', 'base64'),
    () => Buffer.from(secret.split('_')[1] || '', 'utf8'),
  ];

  const contentFormats = [
    // Standard format
    (id, ts, payload) => `${id}.${ts}.${payload}`,
    // Alternative formats
    (id, ts, payload) => `${id},${ts},${payload}`,
    (id, ts, payload) => `${ts}.${id}.${payload}`,
    (id, ts, payload) => `${payload}.${id}.${ts}`,
    (id, ts, payload) => payload,
    (id, ts, payload) => `${id}${ts}${payload}`,
    (id, ts, payload) => `${id}|${ts}|${payload}`,
    // Try with different encodings
    (id, ts, payload) => Buffer.from(`${id}.${ts}.${payload}`, 'utf8'),
    (id, ts, payload) => Buffer.from(`${id}.${ts}.${payload}`, 'utf16le'),
  ];

  const hashAlgorithms = ['sha256', 'sha1', 'sha512', 'md5'];

  let attempts = 0;
  let matches = 0;

  for (let secretMethodIdx = 0; secretMethodIdx < secretMethods.length; secretMethodIdx++) {
    for (let contentFormatIdx = 0; contentFormatIdx < contentFormats.length; contentFormatIdx++) {
      for (let algoIdx = 0; algoIdx < hashAlgorithms.length; algoIdx++) {
        attempts++;

        try {
          const secretBytes = secretMethods[secretMethodIdx]();
          const content = contentFormats[contentFormatIdx](webhookData.webhookId, webhookData.timestamp, webhookData.payload);

          const signature = crypto
            .createHmac(hashAlgorithms[algoIdx], secretBytes)
            .update(typeof content === 'string' ? content : Buffer.from(content))
            .digest('base64');

          const targetSignature = webhookData.signature.replace('v1,', '');

          if (signature === targetSignature || signature === webhookData.expectedSignature) {
            matches++;
            console.log(`🎉 MATCH FOUND! Attempt ${attempts}`);
            console.log(`Secret Method: ${secretMethodIdx + 1}`);
            console.log(`Content Format: ${contentFormatIdx + 1}`);
            console.log(`Hash Algorithm: ${hashAlgorithms[algoIdx]}`);
            console.log(`Generated: ${signature}`);
            console.log(`Target: ${targetSignature}`);
            console.log(`Content: ${typeof content === 'string' ? content.substring(0, 100) + '...' : 'Buffer'}`);
            console.log('---');

            if (signature === targetSignature) {
              console.log('✅ PERFECT MATCH - EXACT SIGNATURE!');
              return {
                secretMethod: secretMethodIdx + 1,
                contentFormat: contentFormatIdx + 1,
                algorithm: hashAlgorithms[algoIdx],
                signature,
                matchesTarget: true
              };
            }
          }
        } catch (error) {
          // Skip invalid combinations
        }
      }
    }
  }

  console.log(`Tested ${attempts} combinations, found ${matches} potential matches`);
  return null;
}

// Example usage with sample data
const sampleData = {
  webhookId: 'msg_32kALB3wGzhx09iXV5rKAjawVg7',
  timestamp: '1757954144',
  signature: 'v1,ViQmpCyAARQNV3jQV7ussI56Eq2YBj8ep6XUvTn40Io=',
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

const secret = 'whsec_MkRFOTc0NEIzMTU1N0UxMzczRDdFMzdDOTJGOUU3NDQ=';

const result = testSignatureGeneration(sampleData, secret);

if (!result) {
  console.log('No exact match found. Trying brute force approach...');

  // Try common variations that might be in Yoco's implementation
  const commonVariations = [
    // Try with different whitespace handling
    () => `${sampleData.webhookId}.${sampleData.timestamp}.${sampleData.payload.trim()}`,
    () => `${sampleData.webhookId}.${sampleData.timestamp}.${JSON.stringify(JSON.parse(sampleData.payload))}`,
    () => `${sampleData.webhookId}.${sampleData.timestamp}.${sampleData.payload.replace(/\s+/g, ' ')}`,

    // Try timestamp variations
    () => `${sampleData.webhookId}.${parseInt(sampleData.timestamp)}.${sampleData.payload}`,
    () => `${sampleData.webhookId}.${sampleData.timestamp}000.${sampleData.payload}`, // Convert to milliseconds
  ];

  const secretBytes = Buffer.from(secret.replace('whsec_', ''), 'base64');

  for (let i = 0; i < commonVariations.length; i++) {
    try {
      const content = commonVariations[i]();
      const signature = crypto
        .createHmac('sha256', secretBytes)
        .update(content)
        .digest('base64');

      const targetSignature = sampleData.signature.replace('v1,', '');

      if (signature === targetSignature) {
        console.log(`🎉 MATCH FOUND in common variations!`);
        console.log(`Variation ${i + 1}: ${signature}`);
        console.log(`Content: ${content.substring(0, 100)}...`);
        break;
      }
    } catch (error) {
      // Skip errors
    }
  }
}

module.exports = { testSignatureGeneration };