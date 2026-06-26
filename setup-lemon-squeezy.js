#!/usr/bin/env node
/**
 * Lemon Squeezy Setup Script
 * 
 * 使用方法：
 * 1. 在 https://app.lemonsqueezy.com/settings/api 创建 API Key
 * 2. 获取你的 Store ID (在 Stores 页面可以看到)
 * 3. 运行: LEMON_SQUEEZY_API_KEY=xxx LEMON_SQUEEZY_STORE_ID=xxx node setup-lemon-squeezy.js
 */

require('dotenv').config();

const LEMON_SQUEEZY_API_KEY = process.env.LEMON_SQUEEZY_API_KEY;
const LEMON_SQUEEZY_STORE_ID = process.env.LEMON_SQUEEZY_STORE_ID;
const WEBHOOK_URL = 'https://content-repurposer-production-34d6.up.railway.app/webhook/lemonsqueezy';
const SIGNING_SECRET = 'whsec-SwErfx4-knEvcMXoMn-pGLXc2FgTvuLj';

if (!LEMON_SQUEEZY_API_KEY || !LEMON_SQUEEZY_STORE_ID) {
  console.log('❌ 请设置环境变量:');
  console.log('   LEMON_SQUEEZY_API_KEY=your-api-key');
  console.log('   LEMON_SQUEEZY_STORE_ID=your-store-id');
  console.log('\n📝 获取方式:');
  console.log('   1. 访问 https://app.lemonsqueezy.com/settings/api 创建 API Key');
  console.log('   2. 访问 https://app.lemonsqueezy.com/settings/stores 获取 Store ID');
  process.exit(1);
}

async function makeRequest(method, endpoint, data = null) {
  const options = {
    method,
    headers: {
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
      'Authorization': `Bearer ${LEMON_SQUEEZY_API_KEY}`
    }
  };
  
  if (data) {
    options.body = JSON.stringify({ data });
  }
  
  const response = await fetch(`https://api.lemonsqueezy.com/v1${endpoint}`, options);
  const json = await response.json();
  
  if (!response.ok) {
    throw new Error(JSON.stringify(json, null, 2));
  }
  
  return json;
}

async function createProduct() {
  console.log('\n📦 创建产品...');
  
  const product = await makeRequest('POST', '/products', {
    type: 'products',
    attributes: {
      name: 'Content Repurposer Pro',
      description: 'AI-powered content repurposing for social media. Transform one piece of content into multiple platforms with a single API call.',
      slug: 'content-repurposer-pro',
      status: 'published',
      stock_track_quantity: false,
      stock_unlimited: true
    },
    relationships: {
      store: {
        data: {
          type: 'stores',
          id: LEMON_SQUEEZY_STORE_ID
        }
      }
    }
  });
  
  console.log('✅ 产品创建成功!');
  console.log(`   Product ID: ${product.data.id}`);
  return product.data.id;
}

async function createVariant(productId, name, price, interval, description, isDefault = false) {
  console.log(`\n   创建 Variant: ${name} ($${price}/${interval})`);
  
  const variant = await makeRequest('POST', '/variants', {
    type: 'variants',
    attributes: {
      name: name,
      description: description,
      price: price * 100, // Convert to cents
      currency: 'usd',
      is_subscription: true,
      interval: interval,
      interval_count: 1,
      trial_interval: null,
      trial_interval_count: null,
      has_free_trial: false,
      status: 'published',
      stock_unlimited: true,
      stock_track_quantity: false,
      sort: isDefault ? 0 : 1
    },
    relationships: {
      product: {
        data: {
          type: 'products',
          id: productId.toString()
        }
      }
    }
  });
  
  console.log(`   ✅ Variant 创建成功!`);
  console.log(`      Variant ID: ${variant.data.id}`);
  console.log(`      Price: $${price}/${interval}`);
  return variant.data.id;
}

async function createWebhook() {
  console.log('\n🪝 创建 Webhook...');
  
  const webhook = await makeRequest('POST', '/webhooks', {
    type: 'webhooks',
    attributes: {
      url: WEBHOOK_URL,
      events: [
        'order_created',
        'subscription_created',
        'subscription_updated',
        'subscription_cancelled',
        'subscription_expired'
      ],
      secret: SIGNING_SECRET
    },
    relationships: {
      store: {
        data: {
          type: 'stores',
          id: LEMON_SQUEEZY_STORE_ID
        }
      }
    }
  });
  
  console.log('✅ Webhook 创建成功!');
  console.log(`   Webhook ID: ${webhook.data.id}`);
  console.log(`   URL: ${WEBHOOK_URL}`);
  console.log(`   Events: order_created, subscription_created, subscription_updated, subscription_cancelled, subscription_expired`);
  return webhook.data.id;
}

async function main() {
  console.log('🚀 Lemon Squeezy Content Repurposer Pro Setup\n');
  console.log('=' .repeat(50));
  
  try {
    // Create product
    const productId = await createProduct();
    
    // Create variants
    await createVariant(
      productId,
      'Starter',
      9,
      'month',
      'Perfect for beginners. 50 API calls/month, 1000 characters per request.',
      true
    );
    
    await createVariant(
      productId,
      'Pro',
      29,
      'month',
      'For professionals. 200 API calls/month, 3000 characters per request.',
      false
    );
    
    await createVariant(
      productId,
      'Business',
      99,
      'month',
      'For teams. 1000 API calls/month, 10000 characters per request.',
      false
    );
    
    // Create webhook
    await createWebhook();
    
    console.log('\n' + '='.repeat(50));
    console.log('\n🎉 Setup 完成!\n');
    console.log('📋 下一步:');
    console.log('   1. 访问 https://app.lemonsqueezy.com 检查你的产品和 Variants');
    console.log('   2. 确保 Variants 的 Checkout Settings 配置正确');
    console.log('   3. 测试 Webhook 功能');
    console.log('\n📚 文档:');
    console.log('   - API: https://api.lemonsqueezy.com/v1');
    console.log('   - Webhook: https://content-repurposer-production-34d6.up.railway.app/webhook/lemonsqueezy');
    console.log('\n💰 准备赚钱吧!\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
