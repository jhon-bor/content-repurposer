const { chromium } = require('playwright');

async function main() {
  console.log('🚀 Railway 自动配置\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('🌐 打开 Railway Dashboard...');
    await page.goto('https://railway.app/dashboard');
    
    console.log('⏳ 等待登录...');
    console.log('   请在浏览器中完成登录');
    console.log('   登录成功后按 Enter 继续...');
    
    // 等待用户登录
    await page.waitForSelector('a[href*="/project/"]', { timeout: 120000 });
    console.log('✅ 登录成功!');
    
    // 导航到项目
    console.log('\n📦 找到 content-repurposer 项目...');
    await page.goto('https://railway.app/project/40037155-92b4-47e2-81b8-872602963593');
    await page.waitForTimeout(3000);
    
    // 点击 Settings
    console.log('⚙️  打开 Settings...');
    await page.getByText('Settings').first().click();
    await page.waitForTimeout(2000);
    
    // 尝试连接 GitHub
    console.log('🔗 查找 Source 配置...');
    const connectButton = page.getByText('Connect Repo').first();
    if (await connectButton.isVisible()) {
      console.log('   找到 Connect Repo 按钮');
      await connectButton.click();
      await page.waitForTimeout(2000);
      
      // 搜索 content-repurposer
      console.log('🔍 搜索 content-repurposer...');
      const searchInput = page.getByPlaceholder('Search for a repo');
      if (await searchInput.isVisible()) {
        await searchInput.fill('content-repurposer');
        await page.waitForTimeout(2000);
        
        // 点击仓库
        const repoOption = page.getByText('jhon-bor/content-repurposer').first();
        if (await repoOption.isVisible()) {
          console.log('✅ 找到仓库!');
          await repoOption.click();
          await page.waitForTimeout(3000);
          console.log('✅ GitHub 仓库已连接!');
        }
      }
    } else {
      console.log('   已经连接了仓库');
    }
    
    // 触发部署
    console.log('\n🔄 触发部署...');
    await page.goto('https://railway.app/project/40037155-92b4-47e2-81b8-872602963593');
    await page.waitForTimeout(2000);
    
    // 点击 Deployments
    const deploymentsTab = page.getByText('Deployments').first();
    if (await deploymentsTab.isVisible()) {
      await deploymentsTab.click();
      await page.waitForTimeout(2000);
      
      // 找 Redeploy 按钮
      const redeployButton = page.getByText('Redeploy').first();
      if (await redeployButton.isVisible()) {
        console.log('   点击 Redeploy...');
        await redeployButton.click();
        await page.waitForTimeout(3000);
        console.log('✅ 部署已触发!');
      }
    }
    
    console.log('\n⏳ 等待部署完成 (约 2-3 分钟)...');
    await page.waitForTimeout(180000);
    
    console.log('\n🎉 完成! 请在浏览器中确认部署状态');
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  }
  
  console.log('\n浏览器保持打开，请确认部署状态');
}

main();
