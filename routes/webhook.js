const express = require('express');
const router = express.Router();
const { verifyLemonSqueezySignature, generateApiKey, hashApiKey } = require('../utils/crypto');
const { createUser, deactivateUser } = require('../utils/db');

router.post('/lemonsqueezy', async (req, res) => {
  try {
    const signature = req.headers['x-signature'];
    
    if (!verifyLemonSqueezySignature(req.body, signature)) {
      console.error('Invalid signature');
      return res.status(403).json({ error: 'Invalid signature' });
    }

    const event = req.body;
    const eventType = event.meta.event_name;
    
    console.log(`Received event: ${eventType}`);

    switch (eventType) {
      case 'order_created': {
        const { customer, order, variant } = event.data.attributes;
        const email = customer.email;
        const customerId = customer.id;
        const orderId = order.id;
        const subscriptionId = order.subscription_id;
        
        let plan = 'starter';
        if (variant.name.toLowerCase().includes('pro')) {
          plan = 'pro';
        } else if (variant.name.toLowerCase().includes('business')) {
          plan = 'business';
        }

        const apiKey = generateApiKey();
        const apiKeyHash = hashApiKey(apiKey);

        await createUser(email, apiKeyHash, plan, customerId, orderId, subscriptionId);
        
        console.log(`User created: ${email}, Plan: ${plan}`);
        
        res.status(200).json({ 
          success: true, 
          message: 'User created successfully',
          apiKey: apiKey 
        });
        break;
      }

      case 'subscription_cancelled':
      case 'subscription_expired': {
        const subscriptionId = event.data.attributes.subscription_id;
        const result = await deactivateUser(subscriptionId);
        
        if (result) {
          console.log(`User deactivated: ${result.email}, Reason: ${eventType}`);
        }
        
        res.status(200).json({ 
          success: true, 
          message: 'Subscription cancelled/expired' 
        });
        break;
      }

      default:
        console.log(`Unhandled event type: ${eventType}`);
        res.status(200).json({ success: true, message: 'Event received but not processed' });
    }

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;