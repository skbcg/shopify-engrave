const { Shopify } = require('@shopify/shopify-api');
const crypto = require('crypto');

// Initialize Shopify context with environment variables
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

// Helper function to validate HMAC
const validateHmac = (queryParams) => {
  const { hmac, ...restParams } = queryParams;
  
  if (!hmac) {
    console.error('HMAC parameter is missing');
    return false;
  }
  
  try {
    // Sort and stringify the parameters
    const message = new URLSearchParams(
      Object.entries(restParams)
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    ).toString();
    
    // Generate the HMAC
    const generatedHash = crypto
      .createHmac('sha256', process.env.SHOPIFY_API_SECRET)
      .update(message)
      .digest('hex');
    
    // Compare the generated hash with the provided HMAC
    const isValid = crypto.timingSafeEqual(
      Buffer.from(generatedHash, 'hex'),
      Buffer.from(hmac, 'hex')
    );
    
    if (!isValid) {
      console.error('HMAC validation failed');
    }
    
    return isValid;
  } catch (error) {
    console.error('Error validating HMAC:', error);
    return false;
  }
};

exports.handler = async (event, context) => {
  console.log('Auth function called with event:', JSON.stringify(event, null, 2));
  
  // Only allow POST requests
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
    
    const { code, hmac, shop, state } = queryStringParameters;
    
    // Validate required parameters
    if (!shop) {
      console.error('Missing shop parameter');
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing shop parameter' })
      };
    }
    
    // Validate HMAC
    if (!validateHmac(queryStringParameters)) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid HMAC' })
      };
    }
    
    // Exchange code for access token
    console.log(`Exchanging code for access token for shop: ${shop}`);
    const accessToken = await Shopify.Auth.getAccessToken(shop, code);
    
    // In a production app, you would store the access token in a database here
    console.log(`Successfully obtained access token for shop: ${shop}`);
    
    // Redirect to the app's main page
    return {
      statusCode: 302,
      headers: {
        'Location': `/?shop=${shop}&host=${queryStringParameters.host || ''}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      body: ''
    };
    
  } catch (error) {
    console.error('Auth error:', error);
    
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
