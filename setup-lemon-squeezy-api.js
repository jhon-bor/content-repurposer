#!/usr/bin/env node
/**
 * Lemon Squeezy API Setup Script
 * 
 * 使用方法：
 * 1. 在 https://app.lemonsqueezy.com/settings/api 创建 API Key
 * 2. 获取你的 Store ID (在 Stores 页面 URL 中)
 * 3. 运行: LEMON_SQUEEZY_API_KEY=xxx LEMON_SQUEEZY_STORE_ID=xxx node setup-lemon-squeezy-api.js
 */

require('dotenv').config();

const LEMON_SQUEEZY_API_KEY = process.env.LEMON_SQUEEZY_API_KEY;
const LEMON_SQUEEZY_STORE_ID = process.env.LEMON_SQUEEZY_STORE_ID;

const WEBHOOK_URL = 'https://content-repurposer-production-34d6.up.railway.app/webhook/lemonsqueezy';
const SIGNING_SECRET = 'whsec-SwErfx4-knEvcMXoMn-pGLXc2FgTvuLj';

if (!LEMON_SQUEEZY_API_KEY || !LEMON_SQUEEZY_STORE_ID) {
  console.log('❌ 请设置环境变量:');
  console.log('   export LEMON_SQUEEZY_API_KEY=your-api-key');
  console.log('   export LEMON_SQUEEZY_STORE_ID=your-store-id');
  console.log('\n📝 获取方式:');
  console.log('   1. API Key: https://app.lemonsqueezy.com/settings/api');
  console.log('   2. Store ID: https://app.lemonsqueezy.com/settings/stores (URL中的数字)');
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
    throw new Error(`API Error: ${response.status} - ${JSON.stringify(json)}`);
  }
  
  return json;
}

async function main() {
  console.log('🚀 Lemon Squeezy Content Repurposer Pro Setup\n');
  console.log('=' .repeat(50));
  
  try {
    console.log('\n📦 步骤 1: 创建产品...');
    const product = await makeRequest('POST', '/products', {
      type: 'products',
      attributes: {
        name: 'Content Repurposer Pro',
        description: 'AI-powered content repurposing for social media',
        slug: 'content-repurposer-pro',
        status: 'published',
        stock_track_quantity: false,
        stock_unlimited: true
      },
      relationships: {
        store: {
          data: { type: 'stores', id: LEMON_SQUEEZY_STORE_ID }
        }
      }
    });
    
    const productId = product.data.id;
    console.log(`✅ 产品创建成功! ID: ${productId}`);
    
    console.log('\n💰 步骤 2: 创建订阅计划...');
    
    const variants = [
      { name: 'Starter', price: 9, description: '50 API calls/month' },
      { name: 'Pro', price: 29, description: '200 API calls/month' },
      { name: 'Business', price: 99, description: '1000 API calls/month' }
    ];
    
    for (const variant of variants) {
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
      
      console.log(`   ✅ ${variant.name}: $${variant.price}/month (ID: ${result.data.id})`);
    }
    
    console.log('\n🪝 步骤 3: 创建 Webhook...');
    const webhook = await makeRequest('POST', '/webhooks', {
      type: 'webhooks',
      attributes: {
        url: WEBHOOK_URL,
        events: ['order_created', 'subscription_cancelled', 'subscription_expired'],
        secret: SIGNING_SECRET
      },
      relationships: {
        store: {
          data: { type: 'stores', id: LEMON_SQUEEZY_STORE_ID }
        }
      }
    });
    
    console.log(`✅ Webhook 创建成功! ID: ${webhook.data.id}`);
    
    console.log('\n' + '='.repeat(50));
    console.log('\n🎉 配置完成!\n');
    console.log('📋 配置摘要:');
    console.log('  - 产品: Content Repurposer Pro (ID: ' + productId + ')');
    console.log('  - 订阅计划:');
    variants.forEach(v => console.log(`    - ${v.name}: $${v.price}/month`));
    console.log('  - Webhook: ' + WEBHOOK_URL);
    console.log('  - Events: order_created, subscription_cancelled, subscription_expired');
    console.log('\n💰 准备赚钱吧!');
    
  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
