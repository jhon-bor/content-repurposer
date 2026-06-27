const crypto = require('crypto');

const SIGNING_SECRET = 'whsec-SwErfx4-knEvcMXoMn-pGLXc2FgTvuLj';

function createSignature(payload, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const digest = hmac.digest('hex');
  return digest;
}

const testPayload = JSON.stringify({
  event_name: 'order_created',
  data: {
    id: 'test-order-123',
    customer_email: 'test@example.com',
    first_order_item: {
      variant_id: 12345,
      product_name: 'Content Repurposer Pro',
      variant_name: 'Starter'
    }
  }
});

const signature = createSignature(testPayload, SIGNING_SECRET);

console.log('Testing webhook with correct signature...');
console.log('Signature:', signature);

fetch('https://content-repurposer-production-34d6.up.railway.app/webhook/lemonsqueezy', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-signature': signature
  },
  body: testPayload
})
.then(res => res.text())
.then(data => {
  console.log('Response:', data);
})
.catch(err => {
  console.error('Error:', err.message);
});
