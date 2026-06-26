# Content Repurposer - 部署指南

## 🚀 当前状态

✅ **已部署**: https://content-repurposer-production-34d6.up.railway.app

## 📋 已验证的端点

| 端点 | 方法 | 用途 | 状态 |
|------|------|------|------|
| `/health` | GET | 健康检查 | ✅ 正常 |
| `/repurpose` | POST | 内容改写（需 API key）| ✅ 正常 |
| `/webhook/lemonsqueezy` | POST | Lemon Squeezy 回调 | ⏳ 待配置 |
| `/admin/keys` | POST | 管理 API keys（需 admin key）| ✅ 正常 |

## 🔧 下一步配置

### 1. Lemon Squeezy 产品创建

访问 https://app.lemonsqueezy.com 并登录，然后：

#### 创建 Product
- **Name**: Content Repurposer Pro
- **Type**: Subscription
- **Description**: AI-powered content repurposing for social media

#### 创建 Variants
1. **Starter** - $9/month
   - 50 API calls/month
   - 1000 characters max per request
   
2. **Pro** - $29/month  
   - 200 API calls/month
   - 3000 characters max per request
   
3. **Business** - $99/month
   - 1000 API calls/month
   - 10000 characters max per request

### 2. 配置 Webhook

1. **Settings** → **Webhooks** → **Add Webhook**
2. **URL**: `https://content-repurposer-production-34d6.up.railway.app/webhook/lemonsqueezy`
3. **Signing Secret**: `whsec-SwErfx4-knEvcMXoMn-pGLXc2FgTvuLj`
4. **Events**: 勾选以下事件：
   - `order_created`
   - `subscription_created`
   - `subscription_updated`
   - `subscription_cancelled`
   - `subscription_expired`

### 3. 配置环境变量（Railway）

在 Railway 项目 → **Variables** 中添加：

```
LEMON_SQUEEZY_SIGNING_SECRET=whsec-SwErfx4-knEvcMXoMn-pGLXc2FgTvuLj
OPENAI_API_KEY=sk-your-openai-api-key
ADMIN_KEY=your-secure-admin-key
JWT_SECRET=your-jwt-secret-key
NODE_ENV=production
```

### 4. 测试 Webhook

运行测试脚本：
```bash
node test-webhook.js
```

## 📖 API 使用方法

### 获取 API Key
购买后，用户会通过 email 收到 API Key（由 webhook 自动生成）

### 使用 API

```bash
curl -X POST https://content-repurposer-production-34d6.up.railway.app/repurpose \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "content": "Your original content here...",
    "target_platform": "twitter"
  }'
```

### 支持的平台
- `twitter` - Twitter/X posts
- `linkedin` - LinkedIn articles
- `facebook` - Facebook posts
- `instagram` - Instagram captions
- `youtube` - YouTube descriptions
- `blog` - Blog posts
- `email` - Email newsletters

## 🎯 商业模式

1. **用户访问你的 Lemonsqueezy 商店**
2. **购买订阅计划**
3. **Lemon Squeezy 发送 webhook 到你的服务器**
4. **服务器验证签名并创建用户 + API Key**
5. **用户通过 email 收到 API Key**
6. **用户使用 API 进行内容改写**
7. **每月自动续费 💰**

## 🆘 故障排除

### Webhook 不工作？
1. 检查 Railway 日志确认 webhook 收到请求
2. 验证 signing secret 是否正确
3. 测试 webhook 端点：
```bash
curl -X POST https://content-repurposer-production-34d6.up.railway.app/webhook/lemonsqueezy \
  -H "Content-Type: application/json" \
  -H "x-signature: sha256=..." \
  -d '{"meta": {"event_name": "order_created"}, "data": {...}}'
```

### API 返回错误？
- 401 Unauthorized - 检查 API Key 是否正确
- 429 Too Many Requests - 超出调用限制
- 400 Bad Request - 请求格式错误

## 📞 支持

如有问题，请检查 Railway 部署日志或联系支持。
