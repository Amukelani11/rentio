const ngrok = require('ngrok');

async function startNgrok() {
  try {
    console.log('🚀 Starting ngrok tunnel...');
    const url = await ngrok.connect({
      addr: 3002,
      proto: 'http'
    });
    
    console.log('✅ Ngrok tunnel started!');
    console.log('🌐 Public URL:', url);
    console.log('🔗 Webhook URL:', `${url}/api/payments/yoco/webhook`);
    console.log('\n📋 Update your Yoco webhook registration with this URL');
    console.log('Then make a test payment to see if the webhook works!');
    
    // Keep the process running
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down ngrok...');
      await ngrok.disconnect();
      await ngrok.kill();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Error starting ngrok:', error);
    process.exit(1);
  }
}

startNgrok();


