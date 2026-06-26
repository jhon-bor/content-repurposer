const API_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5NGQ1OWNlZi1kYmI4LTRlYTUtYjE3OC1kMjU0MGZjZDY5MTkiLCJqdGkiOiIxZjQ0ZmM4Mzg4YTQ5NTVlZmExNDEzNDU5NWNiZTdkM2ZkYTZlMTQxOGFkNWYxYzAxYmJhYzg2ZTdjZjRkMTJiZmE2MzE2OGRlOGJjOTdlMiIsImlhdCI6MTc4MjQ4MjgzNC43OTA3NzgsIm5iZiI6MTc4MjQ4MjgzNC43OTA3ODEsImV4cCI6MTc5ODI0MzIwMC4wNDAyMTYsInN1YiI6Ijc0NDU4MDkiLCJzY29wZXMiOltdfQ.E_Nz5HxbFibjsHhbF-yBXdiYs5oHw6aLjFyTac9fDYe34PaRqIt5rf7H3o1KYuvM8aoMktKv5EC4xFbaBVX1Dt_VxUNd0BKnfALgDgUNYjrhL0XczTdxzXHKBIHuBJqcCC7tjV3oLBfH8tO9JEiG9lcNZPiiACLig_cxEGfJuCy0jsKyurRNcOab2Djnf9NCnMKGy9Ms-0oOlyHdvhqzUgisFKgutRoLZqSF42_jQm4_kMlr1qQ9mli0SWlNOcY19oJdeu-Zd3wB1N89zxLS2hlGHkXiLCkzX-w2CnT2EmWyaUvHnsHxyjlRuCSdVf9bLEEhGWR1gNi56nHLATkBgKc7ebGD0oQJwe53T3TDxBLeVjXs7ccl4NknF8rPpQDeW1hmfMPbWf0cAnB8hAj5ZYgVHoBdPA65YoMUfBJ0umS4pJ4dj7or8zbXt6AlgINBFJ00Gv71OqPmD64ZAPL_hjjsjZbmUwubhQWySrHOxszNdpOJCfcRpIEInNTtsLfSIqvqO1j1uEK_sadyNulh3letsqJiB2nyRJBTf4H8GT1a2siUmjkPnPgbr0EcRsu64GdukdT-xevfEDzZwmgWr00K44xb5jXN3ZFIGm4fENDmrBmn6AiCAUF6nkBwpqM0kU936S4zBQIa2ubGP3e5iXglGR7yqIy-vQeDpxEqJvc';
const STORE_ID = '414952';

const WEBHOOK_URL = 'https://content-repurposer-production-34d6.up.railway.app/webhook/lemonsqueezy';
const SIGNING_SECRET = 'whsec-SwErfx4-knEvcMXoMn-pGLXc2FgTvuLj';

async function makeRequest(method, endpoint, data = null) {
  const options = {
    method,
    headers: {
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
      'Authorization': `Bearer ${API_KEY}`
    }
  };
  
  if (data) {
    options.body = JSON.stringify({ data });
  }
  
  const response = await fetch(`https://api.lemonsqueezy.com/v1${endpoint}`, options);
  const json = await response.json();
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}\n${JSON.stringify(json, null, 2)}`);
  }
  
  return json;
}

async function main() {
  console.log('🚀 Lemon Squeezy Content Repurposer Pro Setup\n');
  console.log('=' .repeat(50));
  
  try {
    console.log('\n📋 步骤 1: 获取商店信息...');
    const store = await makeRequest('GET', `/stores/${STORE_ID}`);
    console.log(`✅ 商店名称: ${store.data.attributes.name}`);
    
    console.log('\n📦 步骤 2: 获取产品列表...');
    const products = await makeRequest('GET', `/products?filter[store_id]=${STORE_ID}`);
    console.log(`现有产品数量: ${products.data.length}`);
    
    let productId = null;
    let productName = 'Content Repurposer Pro';
    
    // 检查是否已存在同名产品
    const existingProduct = products.data.find(p => p.attributes.name === productName);
    if (existingProduct) {
      productId = existingProduct.id;
      console.log(`✅ 找到现有产品: ${productName} (ID: ${productId})`);
    } else {
      console.log('⚠️  API 不支持创建产品，请手动在 Lemon Squeezy 后台创建');
      console.log('   访问: https://app.lemonsqueezy.com/products');
    }
    
    // 如果有产品 ID，创建 variants
    if (productId) {
      console.log('\n💰 步骤 3: 获取现有 Variants...');
      const variants = await makeRequest('GET', `/variants?filter[product_id]=${productId}`);
      console.log(`现有 Variants 数量: ${variants.data.length}`);
      
      variants.data.forEach(v => {
        console.log(`  - ${v.attributes.name}: $${v.attributes.price / 100}/${v.attributes.interval}`);
      });
      
      // 如果 variants 不足，创建新的
      const neededVariants = [
        { name: 'Starter', price: 9, description: '50 API calls per month' },
        { name: 'Pro', price: 29, description: '200 API calls per month' },
        { name: 'Business', price: 99, description: '1000 API calls per month' }
      ];
      
      for (const variant of neededVariants) {
        const exists = variants.data.find(v => v.attributes.name === variant.name);
        if (!exists) {
          console.log(`\n创建 Variant: ${variant.name}...`);
          try {
            const result = await makeRequest('POST', '/variants', {
              type: 'variants',
              attributes: {
                name: variant.name,
                description: variant.description,
                price: variant.price * 100,
                currency: 'usd',
                is_subscription: true,
                interval: 'month',
                interval_count: 1,
                has_free_trial: false,
                status: 'published',
                stock_unlimited: true,
                stock_track_quantity: false
              },
              relationships: {
                product: {
                  data: { type: 'products', id: productId.toString() }
                }
              }
            });
            console.log(`  ✅ 创建成功 (ID: ${result.data.id})`);
          } catch (e) {
            console.log(`  ⚠️  创建失败: ${e.message.split('\n')[0]}`);
          }
        }
      }
    }
    
    console.log('\n🪝 步骤 4: 创建 Webhook...');
    try {
      const webhook = await makeRequest('POST', '/webhooks', {
        type: 'webhooks',
        attributes: {
          url: WEBHOOK_URL,
          events: ['order_created', 'subscription_cancelled', 'subscription_expired'],
          secret: SIGNING_SECRET
        },
        relationships: {
          store: {
            data: { type: 'stores', id: STORE_ID }
          }
        }
      });
      console.log(`✅ Webhook 创建成功! ID: ${webhook.data.id}`);
    } catch (e) {
      if (e.message.includes('422')) {
        console.log('⚠️  Webhook 可能已存在，获取现有 webhooks...');
        const webhooks = await makeRequest('GET', `/webhooks?filter[store_id]=${STORE_ID}`);
        console.log(`现有 Webhooks 数量: ${webhooks.data.length}`);
        webhooks.data.forEach(w => {
          console.log(`  - ${w.attributes.url}`);
        });
      } else {
        console.log('❌ Webhook 创建失败:', e.message.split('\n')[0]);
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('\n📋 配置摘要:');
    console.log('  - 商店: ' + store.data.attributes.name);
    console.log('  - 产品: ' + (productId ? productName : '需手动创建'));
    console.log('  - Webhook URL: ' + WEBHOOK_URL);
    console.log('  - Webhook Events: order_created, subscription_cancelled, subscription_expired');
    
    if (!productId) {
      console.log('\n⚠️  请手动创建产品:');
      console.log('   1. 访问 https://app.lemonsqueezy.com/products');
      console.log('   2. 创建产品 "Content Repurposer Pro" (Subscription 类型)');
      console.log('   3. 创建 3 个 Variants: Starter $9, Pro $29, Business $99');
    }
    
    console.log('\n✅ 自动配置部分完成!');
    
  } catch (error) {
    console.error('\n❌ 错误:');
    console.error(error.message);
    process.exit(1);
  }
}

main();
