const express = require('express');
const router = express.Router();
const { hashApiKey, generateApiKey } = require('../utils/crypto');
const { createUser, getUserByEmail } = require('../utils/db');

router.post('/webhook', async (req, res) => {
  const webhookEvent = req.body;
  
  try {
    if (webhookEvent.event_type === 'CHECKOUT.ORDER.APPROVED') {
      const orderId = webhookEvent.resource.id;
      const payerEmail = webhookEvent.resource.payer.email_address;
      const purchaseUnit = webhookEvent.resource.purchase_units[0];
      const description = purchaseUnit.description;
      const amount = purchaseUnit.amount.value;
      
      let plan = 'starter';
      if (amount >= 99) plan = 'business';
      else if (amount >= 29) plan = 'pro';
      
      let existingUser = await getUserByEmail(payerEmail);
      
      if (!existingUser) {
        const apiKey = generateApiKey();
        const apiKeyHash = hashApiKey(apiKey);
        
        existingUser = await createUser({
          email: payerEmail,
          plan: plan,
          api_key_hash: apiKeyHash,
          created_at: new Date().toISOString()
        });
        
        console.log(`✅ New user created: ${payerEmail} (${plan}) - API Key: ${apiKey}`);
      } else {
        console.log(`ℹ️ Existing user: ${payerEmail} - updating plan to ${plan}`);
      }
      
      res.status(200).json({ received: true, user: existingUser.email, plan: plan });
    } else {
      res.status(200).json({ received: true, ignored: true });
    }
  } catch (error) {
    console.error('❌ PayPal webhook error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

module.exports = router;