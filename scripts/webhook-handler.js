const crypto = require('crypto');
const { saveEngravingToOrder, handleOrderCreate } = require('./save-engraving');

/**
 * Verify the webhook request from Shopify
 * @param {Object} req - The Express request object
 * @param {string} webhookSecret - The webhook secret from your Shopify app settings
 * @returns {boolean} - Whether the webhook is valid
 */
function verifyWebhook(req, webhookSecret) {
  try {
    const hmac = req.get('X-Shopify-Hmac-Sha256');
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    
    const hash = crypto
      .createHmac('sha256', webhookSecret)
      .update(body, 'utf8')
      .digest('base64');
    
    return crypto.timingSafeEqual(
      Buffer.from(hash, 'base64'),
      Buffer.from(hmac, 'base64')
    );
  } catch (error) {
    console.error('Error verifying webhook:', error);
    return false;
  }
}

/**
 * Middleware to handle order creation webhooks
 * This should be used as an Express middleware for the order creation webhook endpoint
 * @param {Object} req - The Express request object
 * @param {Object} res - The Express response object
 * @param {string} webhookSecret - The webhook secret from your Shopify app settings
 */
async function orderCreateWebhookHandler(req, res, webhookSecret) {
  try {
    // Verify the webhook
    if (!verifyWebhook(req, webhookSecret)) {
      console.error('Invalid webhook signature');
      return res.status(401).send('Unauthorized');
    }
    
    // Get the shop domain and access token from the request
    const shop = req.get('X-Shopify-Shop-Domain');
    const accessToken = req.session?.accessToken; // This would come from your session handling
    
    if (!shop || !accessToken) {
      console.error('Missing shop or access token');
      return res.status(400).send('Bad Request');
    }
    
    // Process the order
    const order = req.body;
    await handleOrderCreate(order, shop, accessToken);
    
    res.status(200).send('Webhook processed');
  } catch (error) {
    console.error('Error in orderCreateWebhookHandler:', error);
    res.status(500).send('Internal Server Error');
  }
}

/**
 * Register the order creation webhook with Shopify
 * @param {string} shop - The shop domain (e.g., 'your-store.myshopify.com')
 * @param {string} accessToken - The access token for the shop
 * @param {string} webhookUrl - The URL where Shopify should send the webhook
 * @param {string} apiVersion - The Shopify API version to use
 * @returns {Promise<Object>} - The API response
 */
async function registerOrderCreateWebhook(shop, accessToken, webhookUrl, apiVersion = '2024-01') {
  const client = new Shopify.Clients.Rest(shop, accessToken);
  
  try {
    // First, check if the webhook already exists
    const webhooks = await client.get({
      path: 'webhooks',
    });
    
    // Check for existing webhook with the same address and topic
    const existingWebhook = webhooks.body.webhooks.find(
      webhook => 
        webhook.address === webhookUrl && 
        webhook.topic === 'orders/create'
    );
    
    if (existingWebhook) {
      console.log(`Webhook already registered: ${existingWebhook.id}`);
      return { id: existingWebhook.id, created: false };
    }
    
    // Register the new webhook
    const response = await client.post({
      path: 'webhooks',
      data: {
        webhook: {
          topic: 'orders/create',
          address: webhookUrl,
          format: 'json'
        }
      },
      type: 'JSON'
    });
    
    console.log(`Registered new webhook: ${response.body.webhook.id}`);
    return { id: response.body.webhook.id, created: true };
    
  } catch (error) {
    console.error('Error registering webhook:', error);
    throw error;
  }
}

module.exports = {
  verifyWebhook,
  orderCreateWebhookHandler,
  registerOrderCreateWebhook
};
