require('dotenv').config({ path: '.env.local' });

async function registerWebhook() {
  try {
    const yocoApiKey = process.env.YOCO_SECRET_KEY;
    const webhookUrl = 'https://06e7f58df8ad.ngrok-free.app/api/payments/yoco/webhook';
    
    if (!yocoApiKey) {
      console.error('❌ Missing YOCO_SECRET_KEY in .env.local');
      process.exit(1);
    }

    console.log('🔗 Registering webhook with Yoco...');
    console.log('📡 Webhook URL:', webhookUrl);

    const response = await fetch('https://payments.yoco.com/api/webhooks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${yocoApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'rentio-webhook',
        url: webhookUrl
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Failed to register webhook:', errorData);
      process.exit(1);
    }

    const data = await response.json();
    console.log('✅ Webhook registered successfully!');
    console.log('🔑 Webhook Secret:', data.secret);
    console.log('📋 Webhook ID:', data.id);
    
    console.log('\n⚠️  IMPORTANT: Add this to your .env.local file:');
    console.log(`YOCO_WEBHOOK_SECRET=${data.secret}`);
    
  } catch (error) {
    console.error('❌ Error registering webhook:', error);
    process.exit(1);
  }
}

registerWebhook();
