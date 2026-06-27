const { Pool } = require('pg');
require('dotenv').config();

let pool = null;
let useMemoryStorage = true;

const memoryUsers = [];
const memoryUsage = [];

async function initDatabase() {
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL === 'postgres://user:password@localhost:5432/content_repurposer') {
    console.log('No PostgreSQL configured, using in-memory storage');
    useMemoryStorage = true;
    return;
  }

  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(36) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        api_key_hash VARCHAR(64) NOT NULL,
        plan VARCHAR(20) NOT NULL DEFAULT 'starter',
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        lemon_squeezy_customer_id VARCHAR(255),
        lemon_squeezy_order_id VARCHAR(255),
        lemon_squeezy_subscription_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createUsageTable = `
      CREATE TABLE IF NOT EXISTS api_usage (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        endpoint VARCHAR(50) NOT NULL,
        input_length INT NOT NULL,
        output_length INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await pool.query(createUsersTable);
    await pool.query(createUsageTable);
    useMemoryStorage = false;
    console.log('PostgreSQL database initialized');
  } catch (error) {
    console.error('PostgreSQL connection failed, falling back to in-memory storage:', error.message);
    useMemoryStorage = true;
  }
}

async function createUser(email, apiKeyHash, plan, customerId, orderId, subscriptionId) {
  if (useMemoryStorage) {
    const existingUser = memoryUsers.find(u => u.email === email);
    const userId = existingUser ? existingUser.user_id : crypto.randomUUID();
    
    if (existingUser) {
      existingUser.api_key_hash = apiKeyHash;
      existingUser.plan = plan;
      existingUser.status = 'active';
      existingUser.lemon_squeezy_subscription_id = subscriptionId;
      existingUser.updated_at = new Date();
      return { user_id: existingUser.user_id, plan: existingUser.plan, status: existingUser.status };
    }

    const newUser = {
      user_id: userId,
      email,
      api_key_hash: apiKeyHash,
      plan,
      status: 'active',
      lemon_squeezy_customer_id: customerId,
      lemon_squeezy_order_id: orderId,
      lemon_squeezy_subscription_id: subscriptionId,
      created_at: new Date(),
      updated_at: new Date()
    };
    memoryUsers.push(newUser);
    return { user_id: newUser.user_id, plan: newUser.plan, status: newUser.status };
  }

  const result = await pool.query(
    `INSERT INTO users (user_id, email, api_key_hash, plan, status, lemon_squeezy_customer_id, lemon_squeezy_order_id, lemon_squeezy_subscription_id)
     VALUES ($1, $2, $3, $4, 'active', $5, $6, $7)
     ON CONFLICT (email) DO UPDATE SET api_key_hash = $3, plan = $4, status = 'active', lemon_squeezy_subscription_id = $7, updated_at = CURRENT_TIMESTAMP
     RETURNING user_id, plan, status`,
    [crypto.randomUUID(), email, apiKeyHash, plan, customerId, orderId, subscriptionId]
  );
  return result.rows[0];
}

async function getUserByEmail(email) {
  if (useMemoryStorage) {
    return memoryUsers.find(u => u.email === email);
  }

  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0];
}

async function getUserByApiKey(apiKeyHash) {
  if (useMemoryStorage) {
    return memoryUsers.find(u => u.api_key_hash === apiKeyHash && u.status === 'active');
  }

  const result = await pool.query(
    'SELECT * FROM users WHERE api_key_hash = $1 AND status = $2',
    [apiKeyHash, 'active']
  );
  return result.rows[0];
}

async function deactivateUser(subscriptionId) {
  if (useMemoryStorage) {
    const user = memoryUsers.find(u => u.lemon_squeezy_subscription_id === subscriptionId);
    if (user) {
      user.status = 'inactive';
      user.updated_at = new Date();
      return { email: user.email, plan: user.plan };
    }
    return null;
  }

  const result = await pool.query(
    'UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE lemon_squeezy_subscription_id = $2 RETURNING email, plan',
    ['inactive', subscriptionId]
  );
  return result.rows[0];
}

async function recordUsage(userId, endpoint, inputLength, outputLength) {
  if (useMemoryStorage) {
    memoryUsage.push({
      user_id: userId,
      endpoint,
      input_length: inputLength,
      output_length: outputLength,
      created_at: new Date()
    });
    return;
  }

  await pool.query(
    'INSERT INTO api_usage (user_id, endpoint, input_length, output_length) VALUES ($1, $2, $3, $4)',
    [userId, endpoint, inputLength, outputLength]
  );
}

async function getUsageByUser(userId, days = 30) {
  if (useMemoryStorage) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const userUsage = memoryUsage.filter(u => 
      u.user_id === userId && u.created_at >= cutoffDate
    );
    
    return {
      total_input: userUsage.reduce((sum, u) => sum + u.input_length, 0),
      total_output: userUsage.reduce((sum, u) => sum + u.output_length, 0),
      total_calls: userUsage.length
    };
  }

  const result = await pool.query(
    'SELECT SUM(input_length) as total_input, SUM(output_length) as total_output, COUNT(*) as total_calls FROM api_usage WHERE user_id = $1 AND created_at >= NOW() - INTERVAL $2',
    [userId, `${days} days`]
  );
  return result.rows[0];
}

module.exports = {
  pool,
  initDatabase,
  createUser,
  getUserByEmail,
  getUserByApiKey,
  deactivateUser,
  recordUsage,
  getUsageByUser
};