const express = require('express');
const path = require('path');
const { Shopify } = require('@shopify/shopify-api');
const { verifyWebhook, orderCreateWebhookHandler } = require('./scripts/webhook-handler');
const { saveEngravingToOrder } = require('./scripts/save-engraving');

// Middleware to verify the request is from Shopify
const verifyRequest = (req, res, next) => {
  try {
    const session = Shopify.Utils.loadCurrentSession(req, res, false);
    if (session && session.accessToken) {
      req.session = session;
      return next();
    }
    res.status(401).json({ error: 'Unauthorized' });
  } catch (error) {
    console.error('Session verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Set up all routes for the application
 * @param {express.Application} app - The Express application
 */
const setupRoutes = (app) => {
  // Parse JSON bodies
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0'
    });
  });

  // Webhook handler for app uninstall
  app.post('/api/webhooks/app/uninstalled', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
      const topic = req.get('X-Shopify-Topic');
      const shop = req.get('X-Shopify-Shop-Domain');
      const webhookId = req.get('X-Shopify-Webhook-Id');
      
      if (!topic || !shop || !webhookId) {
        console.error('Missing required webhook headers');
        return res.status(400).json({ error: 'Missing required headers' });
      }

      console.log(`[${new Date().toISOString()}] Received webhook: ${topic} for ${shop} (ID: ${webhookId})`);
      
      // Handle the uninstall webhook
      // You might want to clean up any data associated with this shop
      // For example, delete shop data from your database
      
      res.status(200).json({ success: true, message: 'Webhook processed' });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ 
        error: 'Error processing webhook',
        details: error.message 
      });
    }
  });

  // Webhook handler for order creation
  app.post('/api/webhooks/orders/create', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
      const shop = req.get('X-Shopify-Shop-Domain');
      const topic = req.get('X-Shopify-Topic');
      const webhookId = req.get('X-Shopify-Webhook-Id');
      
      if (!shop || !topic || !webhookId) {
        console.error('Missing required webhook headers');
        return res.status(400).json({ error: 'Missing required headers' });
      }
      
      console.log(`[${new Date().toISOString()}] Received order creation webhook from ${shop} (ID: ${webhookId})`);
      
      // Parse the raw body
      let order;
      try {
        order = JSON.parse(req.body.toString('utf8'));
      } catch (parseError) {
        console.error('Error parsing webhook body:', parseError);
        return res.status(400).json({ error: 'Invalid JSON payload' });
      }
      
      // Get the access token for this shop from your database
      // In a real app, you would look this up from your database
      const accessToken = process.env.SHOPIFY_ACCESS_TOKEN; // This should be fetched from your database
      
      if (!accessToken) {
        console.error('No access token found for shop:', shop);
        return res.status(401).json({ error: 'No access token available' });
      }
      
      // Process the order
      await orderCreateWebhookHandler(req, res, process.env.SHOPIFY_API_SECRET);
      
    } catch (error) {
      console.error('Error in order creation webhook:', error);
      res.status(500).json({ 
        error: 'Error processing order webhook',
        details: error.message 
      });
    }
  });

  // API endpoint for saving engraving data
  app.post('/api/engraving', verifyRequest, async (req, res) => {
    try {
      const { orderId, lineItemId, engravingText, price } = req.body;
      
      // Validate required fields
      if (!orderId || !engravingText) {
        return res.status(400).json({ 
          error: 'Missing required fields',
          required: ['orderId', 'engravingText'],
          received: { orderId, lineItemId, engravingText: !!engravingText, price }
        });
      }
      
      console.log(`[${new Date().toISOString()}] Saving engraving for order ${orderId}${lineItemId ? `, item ${lineItemId}` : ''}`);
      
      // Save the engraving details to the order
      const result = await saveEngravingToOrder(
        req.session.shop,
        req.session.accessToken,
        orderId,
        {
          text: engravingText,
          price: parseFloat(price) || 0,
          lineItemId: lineItemId || null
        }
      );
      
      res.status(200).json({ 
        success: true, 
        message: 'Engraving saved successfully',
        data: {
          orderId,
          lineItemId,
          engravingText,
          price: parseFloat(price) || 0,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error saving engraving:', error);
      res.status(500).json({ 
        error: 'Failed to save engraving',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });
  
  // API endpoint to get engraving details for an order
  app.get('/api/engraving/:orderId', verifyRequest, async (req, res) => {
    try {
      const { orderId } = req.params;
      
      if (!orderId) {
        return res.status(400).json({ error: 'Order ID is required' });
      }
      
      // In a real app, you would fetch this from your database
      // For now, we'll return a mock response
      const engravingData = {
        orderId,
        text: 'Sample engraving text',
        price: 10.00,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json({
        success: true,
        data: engravingData
      });
      
    } catch (error) {
      console.error('Error fetching engraving:', error);
      res.status(500).json({ 
        error: 'Failed to fetch engraving details',
        details: error.message 
      });
    }
  });

  // API endpoint to get app settings
  app.get('/api/settings', verifyRequest, async (req, res) => {
    try {
      // In a real app, you would fetch this from your database
      const settings = {
        engravingPrice: 10.00,
        currency: 'USD',
        maxCharacters: 50,
        enabled: true,
        shop: req.session.shop
      };
      
      res.status(200).json(settings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(500).json({ 
        error: 'Failed to fetch settings',
        details: error.message 
      });
    }
  });

  // API endpoint to update app settings
  app.put('/api/settings', verifyRequest, async (req, res) => {
    try {
      const { engravingPrice, maxCharacters, enabled, currency } = req.body;
      
      // Validate input
      if (engravingPrice !== undefined && isNaN(parseFloat(engravingPrice))) {
        return res.status(400).json({ error: 'Invalid price' });
      }
      
      if (maxCharacters !== undefined && (isNaN(parseInt(maxCharacters)) || maxCharacters < 1)) {
        return res.status(400).json({ error: 'Invalid max characters' });
      }
      
      // In a real app, you would save these settings to your database
      console.log(`Updating settings for ${req.session.shop}:`, { 
        engravingPrice, 
        maxCharacters, 
        enabled,
        currency
      });
      
      // Return the updated settings
      const updatedSettings = {
        engravingPrice: engravingPrice !== undefined ? parseFloat(engravingPrice) : 10.00,
        maxCharacters: maxCharacters !== undefined ? parseInt(maxCharacters) : 50,
        enabled: enabled !== undefined ? Boolean(enabled) : true,
        currency: currency || 'USD',
        updatedAt: new Date().toISOString()
      };
      
      res.status(200).json({ 
        success: true, 
        message: 'Settings updated successfully',
        data: updatedSettings
      });
      
    } catch (error) {
      console.error('Error updating settings:', error);
      res.status(500).json({ 
        error: 'Failed to update settings',
        details: error.message 
      });
    }
  });

  // Serve static files from the public directory
  app.use(express.static(path.join(__dirname, 'public')));
  
  // Handle 404 - Keep this as the last route
  app.use((req, res) => {
    res.status(404).json({
      error: 'Not Found',
      path: req.path,
      method: req.method
    });
  });
  
  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  });
};

module.exports = { setupRoutes };
