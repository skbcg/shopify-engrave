const { Shopify } = require('@shopify/shopify-api');

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

// Helper function to get the session for the request
const getSession = async (shop) => {
  try {
    // In a production app, you would retrieve the session from your database
    // For this example, we'll use the memory session storage
    const session = await Shopify.Utils.loadCurrentSession(
      new Shopify.Auth.SessionStorage(),
      shop,
      true // isOnline
    );
    
    if (!session) {
      throw new Error('No session found');
    }
    
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    throw error;
  }
};

exports.handler = async (event, context) => {
  console.log('API function called with event:', JSON.stringify(event, null, 2));
  
  // Only allow GET and POST requests
  if (!['GET', 'POST'].includes(event.httpMethod)) {
    console.error('Method not allowed:', event.httpMethod);
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }
  
  try {
    const { httpMethod, queryStringParameters, body: requestBody } = event;
    const { shop } = queryStringParameters || {};
    
    // Validate shop parameter
    if (!shop) {
      console.error('Missing shop parameter');
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing shop parameter' })
      };
    }
    
    // Get the session for the request
    const session = await getSession(shop);
    
    // Handle different API endpoints based on the path
    const path = event.path.replace('/.netlify/functions/api', '');
    
    switch (path) {
      case '/products':
        if (httpMethod === 'GET') {
          // Get products
          const client = new Shopify.Clients.Rest(session.shop, session.accessToken);
          const response = await client.get({
            path: 'products',
            query: {
              limit: 10,
              fields: 'id,title,handle,images,variants'
            }
          });
          
          return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response.body)
          };
        }
        break;
        
      case '/settings':
        if (httpMethod === 'GET') {
          // Get app settings
          // In a production app, you would retrieve these from your database
          return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              enabled: true,
              price: 10.00,
              currency: 'USD',
              maxLength: 100
            })
          };
        } else if (httpMethod === 'POST') {
          // Save app settings
          // In a production app, you would save these to your database
          const settings = JSON.parse(requestBody || '{}');
          console.log('Saving settings:', settings);
          
          return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              success: true,
              message: 'Settings saved successfully',
              settings
            })
          };
        }
        break;
        
      default:
        return {
          statusCode: 404,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Not Found' })
        };
    }
    
    // If we get here, the method is not allowed for the path
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
    
  } catch (error) {
    console.error('API error:', error);
    
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
