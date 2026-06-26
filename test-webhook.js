const crypto = require('crypto');

const WEBHOOK_URL = 'https://content-repurposer-production-34d6.up.railway.app/webhook/lemonsqueezy';
const SIGNING_SECRET = 'whsec-SwErfx4-knEvcMXoMn-pGLXc2FgTvuLj';

function createSignature(payload, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  return `sha256=${hmac.digest('hex')}`;
}

const testPayload = {
  meta: {
    event_name: 'order_created',
    event_id: 'evt_test_' + Date.now(),
    test_mode: true
  },
  data: {
    type: 'orders',
    id: 'test_order_' + Date.now(),
    attributes: {
      store_id: 414952,
      customer_id: 7445809,
      order_number: 'LS-1234',
      total: 900,
      currency: 'usd',
      status: 'paid',
      user_email: 'test@example.com',
      user_name: 'Test User',
      customer: {
        id: 7445809,
        email: 'test@example.com',
        name: 'Test User'
      },
      order: {
        id: 'test_order_' + Date.now(),
        status: 'paid',
        created_at: new Date().toISOString()
      },
      product_id: 1165713,
      variant_id: 2492713,
      product_name: 'Content Repurposer Pro',
      variant_name: 'Starter',
      subscription_id: 'sub_test_' + Date.now()
    }
  }
};

const signature = createSignature(testPayload, SIGNING_SECRET);

console.log('🧪 测试 Lemon Squeezy Webhook\n');
console.log('📤 发送测试订单...');
console.log('   邮箱: test@example.com');
console.log('   计划: Starter ($9/month)');

const { execSync } = require('child_process');

try {
  const result = execSync(`curl -s -X POST "${WEBHOOK_URL}" \\
    -H "Content-Type: application/json" \\
    -H "x-signature: ${signature}" \\
    -d '${JSON.stringify(testPayload).replace(/'/g, "'\\''")}'`, { encoding: 'utf-8' });
  
  console.log('\n✅ 服务器响应:');
  console.log(result);
  
  try {
    const json = JSON.parse(result);
    if (json.success && json.apiKey) {
      console.log('\n🎉 API Key 创建成功!');
      console.log('   API Key: ' + json.apiKey);
      console.log('   邮箱: test@example.com');
      console.log('\n💡 现在可以使用这个 API Key 测试 /repurpose 端点');
    }
  } catch (e) {
    // 可能不是 JSON 格式
  }
  
} catch (error) {
  console.log('\n❌ 请求失败:', error.message);
  if (error.stdout) console.log('响应:', error.stdout);
  if (error.stderr) console.log('错误:', error.stderr);
}
