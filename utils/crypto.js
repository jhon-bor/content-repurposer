const crypto = require('crypto');
require('dotenv').config();

const API_KEY_PREFIX = process.env.API_KEY_PREFIX || 'sk';

function generateApiKey() {
  const randomBytes = crypto.randomBytes(32).toString('base64url');
  return `${API_KEY_PREFIX}-${randomBytes}`;
}

function verifyLemonSqueezySignature(requestBody, signatureHeader) {
  const signingSecret = process.env.LEMON_SQUEEZY_SIGNING_SECRET;
  
  if (!signingSecret) {
    console.error('LEMON_SQUEEZY_SIGNING_SECRET not configured');
    return false;
  }

  if (!signatureHeader) {
    console.error('No signature header provided');
    return false;
  }

  const hmac = crypto.createHmac('sha256', signingSecret);
  const digest = hmac.update(JSON.stringify(requestBody)).digest('hex');
  const expectedSignature = `sha256=${digest}`;

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signatureHeader)
  );
}

function hashApiKey(apiKey) {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

function generateUserId() {
  return crypto.randomBytes(16).toString('hex');
}

module.exports = {
  generateApiKey,
  verifyLemonSqueezySignature,
  hashApiKey,
  generateUserId
};