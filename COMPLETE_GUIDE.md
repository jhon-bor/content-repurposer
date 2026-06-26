# 🎉 Content Repurposer Pro - 最终完成指南

## ✅ 当前状态

服务器已成功部署并运行：
- 🌐 **URL**: https://content-repurposer-production-34d6.up.railway.app
- ✅ **健康检查**: `{"status": "ok", "model": "deepseek-v4-pro", "has_admin": true, "has_webhook": true}`

---

## ⚡ 最后一步：配置 Lemon Squeezy

### 方法 A: 使用 API 自动配置（推荐）

```bash
cd /Users/jhon/Downloads/agent

# 设置环境变量（替换为你的信息）
export LEMON_SQUEEZY_API_KEY=sk_your_api_key_here
export LEMON_SQUEEZY_STORE_ID=12345

# 运行配置脚本
node setup-lemon-squeezy-api.js
```

### 方法 B: 手动配置

**步骤 1: 创建产品**
1. 访问 https://app.lemonsqueezy.com/products
2. 点击 **Create product**
3. 填写：
   - Name: `Content Repurposer Pro`
   - Type: `Subscription`

**步骤 2: 创建订阅计划**
创建 3 个 Variants：
- **Starter**: $9/month
- **Pro**: $29/month  
- **Business**: $99/month

**步骤 3: 配置 Webhook**
1. Settings → Webhooks → Add webhook
2. URL: `https://content-repurposer-production-34d6.up.railway.app/webhook/lemonsqueezy`
3. Secret: `whsec-SwErfx4-knEvcMXoMn-pGLXc2FgTvuLj`
4. Events: 勾选 `order_created`, `subscription_cancelled`, `subscription_expired`

---

## 🚀 测试完整流程

### 1. 创建测试用户
```bash
curl -X POST https://content-repurposer-production-34d6.up.railway.app/admin/keys \
  -H "Content-Type: application/json" \
  -H "x-admin-key: admin-secret-key" \
  -d '{"email": "test@example.com", "plan": "pro"}'
```

### 2. 使用 API 进行内容改写
```bash
curl -X POST https://content-repurposer-production-34d6.up.railway.app/repurpose \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-your-api-key-here" \
  -d '{
    "content": "人工智能正在改变我们的工作方式。机器学习算法可以自动完成重复性任务，让人类专注于更有创造性的工作。",
    "target_platform": "twitter"
  }'
```

---

## 💰 变现流程

```
用户购买 → Lemon Squeezy Webhook → 服务器自动生成 API Key → 用户收到邮件 → 使用 API → 自动续费 💰
```

---

## 📁 项目文件

| 文件 | 说明 |
|------|------|
| `server.js` | 主服务器 |
| `routes/api.js` | API 端点 |
| `routes/webhook.js` | Webhook 处理 |
| `setup-lemon-squeezy-api.js` | Lemon Squeezy API 配置脚本 |
| `test-webhook.js` | Webhook 测试脚本 |

---

## 🆘 故障排除

### Webhook 不工作？
```bash
# 测试 Webhook
node test-webhook.js
```

### API 返回错误？
- **401**: 检查 API Key 是否正确
- **429**: 超出调用限制
- **500**: 服务器内部错误，检查 Railway 日志

---

## 🎊 恭喜！

完成 Lemon Squeezy 配置后，你的 Content Repurposer Pro 就可以开始赚钱了！

**祝生意兴隆！** 🚀💰
