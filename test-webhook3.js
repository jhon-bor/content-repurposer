const crypto = require('crypto');

const SIGNING_SECRET = 'whsec-SwErfx4-knEvcMXoMn-pGLXc2FgTvuLj';

function createSignature(payload, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  return hmac.digest('hex');
}

const testPayload = JSON.stringify({
  "meta": {
    "event_name": "order_created",
    "custom_data": null
  },
  "data": {
    "type": "orders",
    "id": "123456",
    "attributes": {
      "store_id": 414952,
      "customer_id": 789012,
      "identifier": "order-abc123",
      "order_number": 1,
      "user_name": "Test User",
      "user_email": "test@example.com",
      "currency": "USD",
      "currency_rate": "1.00000000",
      "subtotal": 900,
      "discount_total": 0,
      "tax": 0,
      "total": 900,
      "subtotal_usd": 900,
      "discount_total_usd": 0,
      "tax_usd": 0,
      "total_usd": 900,
      "tax_name": null,
      "tax_rate": "0.00",
      "status": "paid",
      "first_order_item": {
        "variant_id": 12345,
        "product_id": 67890,
        "product_name": "Content Repurposer Pro",
        "variant_name": "Starter",
        "price": 900,
        "order_id": 123456
      }
    }
  }
});

const signature = createSignature(testPayload, SIGNING_SECRET);

console.log('Testing order_created webhook...');

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
  console.log('Status: Success');
  console.log('Response:', data);
})
.catch(err => {
  console.error('Error:', err.message);
});
