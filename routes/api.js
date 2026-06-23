const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const { getUserByApiKey, hashApiKey, recordUsage, getUsageByUser } = require('../utils/db');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const PLANS = {
  starter: { maxLength: 1000, maxCalls: 100 },
  pro: { maxLength: 3000, maxCalls: 500 },
  business: { maxLength: 10000, maxCalls: 5000 }
};

async function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No API key provided' });
  }

  const apiKey = authHeader.substring(7);
  const apiKeyHash = hashApiKey(apiKey);
  const user = await getUserByApiKey(apiKeyHash);

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: Invalid API key' });
  }

  req.user = user;
  next();
}

router.post('/repurpose', authenticate, async (req, res) => {
  try {
    const { content, target_platform } = req.body;
    const user = req.user;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const planLimits = PLANS[user.plan] || PLANS.starter;

    if (content.length > planLimits.maxLength) {
      return res.status(400).json({ 
        error: `Content exceeds maximum length for ${user.plan} plan (${planLimits.maxLength} characters)` 
      });
    }

    const usage = await getUsageByUser(user.user_id);
    const totalCalls = parseInt(usage.total_calls) || 0;

    if (totalCalls >= planLimits.maxCalls) {
      return res.status(429).json({ 
        error: `API call limit reached for ${user.plan} plan (${planLimits.maxCalls} calls/month)` 
      });
    }

    const platformInstructions = {
      twitter: 'Rewrite this content into a concise, engaging Twitter thread with hashtags. Keep each tweet under 280 characters.',
      linkedin: 'Rewrite this content into a professional LinkedIn post with proper formatting, bullet points, and industry-relevant hashtags.',
      facebook: 'Rewrite this content into an engaging Facebook post with a friendly tone, emojis, and questions to encourage comments.',
      instagram: 'Rewrite this content into Instagram captions with engaging hooks, line breaks, and relevant hashtags.',
      youtube: 'Rewrite this content into a YouTube video script with an attention-grabbing intro, detailed body, and strong call-to-action.',
      blog: 'Rewrite this content into a well-structured blog post with headings, subheadings, and a conclusion.',
      email: 'Rewrite this content into an email newsletter with a compelling subject line and clear call-to-action.'
    };

    const instruction = platformInstructions[target_platform] || 
      'Rewrite this content into a more engaging and shareable format suitable for social media.';

    const prompt = `${instruction}\n\nOriginal content:\n${content}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 3000
    });

    const repurposedContent = response.choices[0].message.content;

    await recordUsage(user.user_id, '/repurpose', content.length, repurposedContent.length);

    res.status(200).json({
      success: true,
      content: repurposedContent,
      input_length: content.length,
      output_length: repurposedContent.length,
      plan: user.plan
    });

  } catch (error) {
    console.error('Repurpose error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/usage', authenticate, async (req, res) => {
  try {
    const user = req.user;
    const usage = await getUsageByUser(user.user_id);
    const planLimits = PLANS[user.plan] || PLANS.starter;

    res.status(200).json({
      success: true,
      plan: user.plan,
      total_calls: parseInt(usage.total_calls) || 0,
      max_calls: planLimits.maxCalls,
      total_input_chars: parseInt(usage.total_input) || 0,
      total_output_chars: parseInt(usage.total_output) || 0
    });

  } catch (error) {
    console.error('Usage error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Content Repurposer API is running',
    timestamp: new Date().toISOString()
  });
});

// Admin endpoint for managing API keys
router.post('/admin/keys', async (req, res) => {
  try {
    const adminKey = req.headers['x-admin-key'];
    const expectedAdminKey = process.env.ADMIN_KEY || 'admin-secret-key';
    
    if (adminKey !== expectedAdminKey) {
      return res.status(403).json({ error: 'Invalid admin key' });
    }

    const { email, plan } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const { createUser } = require('../utils/db');
    const { generateApiKey, hashApiKey } = require('../utils/crypto');
    
    const apiKey = generateApiKey();
    const apiKeyHash = hashApiKey(apiKey);
    
    await createUser(email, apiKeyHash, plan || 'starter', null, null, null);
    
    res.status(200).json({
      success: true,
      apiKey: apiKey,
      email: email,
      plan: plan || 'starter'
    });

  } catch (error) {
    console.error('Admin key creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;