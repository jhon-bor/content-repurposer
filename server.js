const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

const apiRoutes = require('./routes/api');
const webhookRoutes = require('./routes/webhook');
const { initDatabase } = require('./utils/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint (no auth required)
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Content Repurposer API is running',
    timestamp: new Date().toISOString()
  });
});

// Repurpose endpoint (no /api prefix)
app.post('/repurpose', async (req, res) => {
  // Import and use the router logic
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'API key required. Get one at https://jhon.lemonsqueezy.com' });
  }

  const apiKey = authHeader.substring(7);
  const { hashApiKey } = require('./utils/crypto');
  const { getUserByApiKey, recordUsage, getUsageByUser } = require('./utils/db');
  
  const apiKeyHash = hashApiKey(apiKey);
  const user = await getUserByApiKey(apiKeyHash);

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: Invalid API key' });
  }

  const { content, target_platform } = req.body;
  
  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  const PLANS = {
    starter: { maxLength: 1000, maxCalls: 100 },
    pro: { maxLength: 3000, maxCalls: 500 },
    business: { maxLength: 10000, maxCalls: 5000 }
  };

  const planLimits = PLANS[user.plan] || PLANS.starter;

  if (content.length > planLimits.maxLength) {
    return res.status(400).json({ 
      error: `Content exceeds maximum length for ${user.plan} plan` 
    });
  }

  const usage = await getUsageByUser(user.user_id);
  const totalCalls = parseInt(usage.total_calls) || 0;

  if (totalCalls >= planLimits.maxCalls) {
    return res.status(429).json({ error: 'API call limit reached' });
  }

  res.status(200).json({
    success: true,
    message: 'Content repurposing endpoint ready. Please configure OpenAI API key for full functionality.',
    user_plan: user.plan
  });
});

app.use('/api', apiRoutes);
app.use('/webhook', webhookRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/docs', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'docs.html'));
});

app.get('/pricing', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pricing.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Content Repurposer API running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`📍 Webhook: http://localhost:${PORT}/webhook/lemonsqueezy`);
      console.log(`📍 Repurpose API: http://localhost:${PORT}/api/repurpose`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();