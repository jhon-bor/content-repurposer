# 🎯 Lemon Squeezy 自动化设置指南

## 你需要做的

由于 Lemon Squeezy 需要账户认证，我无法自动帮你完成所有配置。但我已经创建了一个**一键自动化脚本**，你只需要：

### 步骤 1: 获取 Lemon Squeezy API Key

1. 访问 https://app.lemonsqueezy.com/settings/api
2. 点击 **Create API Key**
3. 给它起个名字（如：`content-repurposer-setup`）
4. 复制生成的 API Key（格式：`AValidApiKeyHere`）

### 步骤 2: 获取 Store ID

1. 访问 https://app.lemonsqueezy.com/settings/stores
2. 找到你的商店，点击进入
3. 在 URL 中可以看到 Store ID（数字）
   - 例如：`https://app.lemonsqueezy.com/settings/stores/12345` → Store ID 是 `12345`

### 步骤 3: 运行自动化脚本

```bash
cd /Users/jhon/Downloads/agent
LEMON_SQUEEZY_API_KEY=你的APIKey LEMON_SQUEEZY_STORE_ID=你的StoreID node setup-lemon-squeezy.js
```

脚本会自动完成：
- ✅ 创建产品 "Content Repurposer Pro"
- ✅ 创建 3 个 Variants（Starter $9, Pro $29, Business $99）
- ✅ 创建 Webhook 并配置所有事件

### 步骤 4: 验证部署

完成后运行：
```bash
curl https://content-repurposer-production-34d6.up.railway.app/health
```

应该返回：
```json
{"status": "ok", "model": "deepseek-v4-pro", "has_admin": true, "has_webhook": true}
```

## 📝 脚本详情

脚本文件：`setup-lemon-squeezy.js`

会自动创建：

### 产品信息
- **名称**: Content Repurposer Pro
- **描述**: AI-powered content repurposing for social media
- **状态**: Published

### Variants（订阅方案）
1. **Starter** - $9/月
   - 50 API calls/month
   - 1000 characters per request
   
2. **Pro** - $29/月
   - 200 API calls/month
   - 3000 characters per request
   
3. **Business** - $99/月
   - 1000 API calls/month
   - 10000 characters per request

### Webhook 配置
- **URL**: `https://content-repurposer-production-34d6.up.railway.app/webhook/lemonsqueezy`
- **Secret**: `whsec-SwErfx4-knEvcMXoMn-pGLXc2FgTvuLj`
- **Events**:
  - `order_created`
  - `subscription_created`
  - `subscription_updated`
  - `subscription_cancelled`
  - `subscription_expired`

## 🚀 完成后

你的变现流程就完成了：

1. 用户访问你的 Lemon Squeezy 商店购买订阅
2. Lemon Squeezy 发送 Webhook 到你的服务器
3. 服务器自动创建用户并生成 API Key
4. 用户收到包含 API Key 的确认邮件
5. 用户开始使用 API 进行内容改写
6. 每月自动续费 💰💰💰

## 🆘 遇到问题？

如果脚本运行失败，可能的原因：
1. API Key 过期或无效
2. Store ID 不正确
3. API 调用频率限制（稍后再试）

你可以手动在 Lemon Squeezy Dashboard 中完成这些配置，或者联系支持。
