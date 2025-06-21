const { Shopify } = require('@shopify/shopify-api');
const crypto = require('crypto');

// Initialize Shopify context
const initializeShopifyContext = () => {
  try {
    // Validate required environment variables
    const requiredEnvVars = ['SHOPIFY_API_KEY', 'SHOPIFY_API_SECRET', 'URL', 'SCOPES'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    // Initialize Shopify context
    Shopify.Context.initialize({
      API_KEY: process.env.SHOPIFY_API_KEY,
      API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
      SCOPES: process.env.SCOPES ? process.env.SCOPES.split(',') : ['write_products', 'write_orders'],
      HOST_NAME: process.env.URL.replace(/^https?:\/\//, ''),
      HOST_SCHEME: process.env.URL.split('://')[0],
      API_VERSION: '2024-01',
      IS_EMBEDDED_APP: true,
      SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(),
      LOG_FILE: process.env.NETLIFY === 'true' ? '/tmp/shopify-app.log' : 'shopify-app.log'
    });
    
    console.log('Shopify context initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Shopify context:', error);
    throw error;
  }
};

// Initialize Shopify context when the module loads
initializeShopifyContext();

exports.handler = async (event, context) => {
  console.log('Install function called with event:', JSON.stringify(event, null, 2));
  
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    console.error('Method not allowed:', event.httpMethod);
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }
  
  try {
    const { queryStringParameters } = event;
    
    if (!queryStringParameters) {
      console.error('No query parameters provided');
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing query parameters' })
      };
    }
    
    const { shop } = queryStringParameters;
    
    // Validate shop parameter
    if (!shop) {
      console.error('Missing shop parameter');
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing shop parameter' })
      };
    }
    
    // Generate a random nonce for the OAuth flow
    const nonce = crypto.randomBytes(16).toString('hex');
    
    // Generate the authorization URL
    const authUrl = Shopify.Auth.beginAuth(
      `https://${shop}/admin/oauth/authorize`,
      shop,
      process.env.SHOPIFY_API_KEY,
      nonce
    );
    
    console.log(`Redirecting to authorization URL: ${authUrl}`);
    
    // Redirect to the authorization URL
    return {
      statusCode: 302,
      headers: {
        'Location': authUrl,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      body: ''
    };
    
  } catch (error) {
    console.error('Install error:', error);
    
    // Handle specific Shopify API errors
    if (error instanceof Shopify.Errors.ShopifyError) {
      return {
        statusCode: error.response?.statusCode || 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: error.message,
          code: error.code,
          status: error.response?.statusCode
        })
      };
    }
    
    // Handle other errors
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error.message
      })
    };
  }
};
