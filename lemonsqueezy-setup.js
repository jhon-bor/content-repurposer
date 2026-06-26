const { chromium } = require('playwright');

const CONFIG = {
  productName: 'Content Repurposer Pro',
  variants: [
    { name: 'Starter', price: 9, calls: 50 },
    { name: 'Pro', price: 29, calls: 200 },
    { name: 'Business', price: 99, calls: 1000 }
  ],
  webhook: {
    url: 'https://content-repurposer-production-34d6.up.railway.app/webhook/lemonsqueezy',
    secret: 'whsec-SwErfx4-knEvcMXoMn-pGLXc2FgTvuLj',
    events: ['order_created', 'subscription_cancelled', 'subscription_expired']
  }
};

async function main() {
  console.log('🚀 启动 LemonSqueezy 自动化配置...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 300
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('📍 步骤 1: 导航到产品页面...');
    await page.goto('https://app.lemonsqueezy.com/products');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('\n📍 步骤 2: 创建新产品...');
    const createBtn = await page.$('button:has-text("Create product")');
    if (createBtn) {
      await createBtn.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
    } else {
      const newBtn = await page.$('a:has-text("Create product"), [data-testid="create-product"]');
      if (newBtn) {
        await newBtn.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1500);
      } else {
        console.log('❌ 未找到创建产品按钮');
        await browser.close();
        return;
      }
    }
    
    console.log('填写产品名称...');
    await page.fill('input[name="name"]', CONFIG.productName);
    await page.waitForTimeout(500);
    
    console.log('选择 Subscription 类型...');
    const subType = await page.$('button:has-text("Subscription")');
    if (subType) {
      await subType.click();
      await page.waitForTimeout(500);
    }
    
    console.log('\n📍 步骤 3: 创建 Variants...');
    
    for (let i = 0; i < CONFIG.variants.length; i++) {
      const variant = CONFIG.variants[i];
      console.log(`\n创建 ${variant.name}: $${variant.price}/month`);
      
      if (i > 0) {
        await page.click('button:has-text("Add variant")');
        await page.waitForTimeout(800);
      }
      
      const nameInputs = await page.$$('input[name*="variant"]');
      if (nameInputs[i]) await nameInputs[i].fill(variant.name);
      
      const priceInputs = await page.$$('input[type="number"]');
      if (priceInputs[i]) await priceInputs[i].fill(variant.price.toString());
      
      const descInputs = await page.$$('textarea');
      if (descInputs[i]) await descInputs[i].fill(`${variant.calls} API calls/month`);
      
      await page.waitForTimeout(300);
    }
    
    console.log('\n保存产品...');
    await page.click('button:has-text("Save")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('\n📍 步骤 4: 配置 Webhook...');
    await page.goto('https://app.lemonsqueezy.com/settings/webhooks');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('创建 Webhook...');
    await page.click('button:has-text("Create webhook")');
    await page.waitForTimeout(1000);
    
    console.log('填写 URL...');
    await page.fill('input[name="url"]', CONFIG.webhook.url);
    
    console.log('填写 Secret...');
    await page.fill('input[name="secret"]', CONFIG.webhook.secret);
    
    console.log('选择 Events...');
    for (const event of CONFIG.webhook.events) {
      const checkbox = await page.$(`label:has-text("${event}") input[type="checkbox"]`);
      if (checkbox) await checkbox.check();
    }
    
    console.log('\n保存 Webhook...');
    await page.click('button:has-text("Save")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('\n✅ 配置完成！');
    console.log('\n📋 配置摘要:');
    console.log('  - 产品: ' + CONFIG.productName);
    CONFIG.variants.forEach(v => {
      console.log(`    - ${v.name}: $${v.price}/month (${v.calls} calls)`);
    });
    console.log('  - Webhook: ' + CONFIG.webhook.url);
    console.log('  - Events: ' + CONFIG.webhook.events.join(', '));
    
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    console.log('请检查浏览器窗口，可能需要手动完成某些步骤');
    await page.waitForTimeout(10000);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
