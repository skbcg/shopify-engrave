const { shopifyApi, LATEST_API_VERSION } = require('@shopify/shopify-api');
const { restResources } = require('@shopify/shopify-api/rest/admin/2024-01');

const shopify = new shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: ['write_products', 'read_products', 'write_metaobjects'],
  hostName: process.env.HOST.replace(/^https?:\/\//, ''),
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  restResources,
});

// Namespace for our metafields
const NAMESPACE = 'engraving';

// Get all products with engraving status
const getProducts = async (session, query = '') => {
  try {
    const client = new shopify.clients.Rest({ session });
    
    // First, get all products
    const productsResponse = await client.get({
      path: 'products',
      query: {
        status: 'active',
        limit: 100,
        fields: 'id,title,status,images',
        ...(query && { title: query })
      }
    });

    const products = productsResponse.body.products || [];
    
    // Get all product metafields in one go
    const productIds = products.map(p => `gid://shopify/Product/${p.id}`);
    const metafieldsResponse = await client.post({
      path: 'graphql.json',
      data: {
        query: `
          query productMetafields($ids: [ID!]!) {
            nodes(ids: $ids) {
              ... on Product {
                id
                metafield(namespace: "${NAMESPACE}", key: "enabled") {
                  value
                }
                metafield(namespace: "${NAMESPACE}", key: "price") {
                  value
                }
              }
            }
          }
        `,
        variables: {
          ids: productIds
        }
      }
    });

    const metafieldsMap = {};
    metafieldsResponse.body.data.nodes.forEach(node => {
      if (node) {
        const productId = node.id.split('/').pop();
        metafieldsMap[productId] = {
          engravingEnabled: node.metafield?.value === 'true',
          engravingPrice: parseFloat(node.metafield?.price?.value) || null
        };
      }
    });

    // Combine product data with metafields
    return products.map(product => ({
      id: product.id.toString(),
      title: product.title,
      status: product.status.toUpperCase(),
      image: product.images?.[0]?.src || null,
      engravingEnabled: metafieldsMap[product.id]?.engravingEnabled || false,
      engravingPrice: metafieldsMap[product.id]?.engravingPrice || null
    }));
  } catch (error) {
    console.error('Error getting products:', error);
    throw error;
  }
};

// Toggle engraving for a product
const toggleProductEngraving = async (session, productId, enabled) => {
  try {
    const client = new shopify.clients.Rest({ session });
    
    // First, get the product to check if metafield exists
    const productResponse = await client.get({
      path: `products/${productId}`,
      query: { fields: 'id' }
    });

    if (!productResponse.body.product) {
      throw new Error('Product not found');
    }

    // Update or create the metafield
    await client.post({
      path: 'graphql.json',
      data: {
        query: `
          mutation productUpdate($input: ProductInput!) {
            productUpdate(input: $input) {
              product {
                id
              }
              userErrors {
                field
                message
              }
            }
          }
        `,
        variables: {
          input: {
            id: `gid://shopify/Product/${productId}`,
            metafields: [
              {
                namespace: NAMESPACE,
                key: 'enabled',
                type: 'boolean',
                value: enabled.toString()
              }
            ]
          }
        }
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error toggling product engraving:', error);
    throw error;
  }
};

// API handler
export default async function handler(req, res) {
  try {
    // Get session from request (handled by Shopify's auth middleware)
    const session = req.session;
    
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Handle GET /api/products
    if (req.method === 'GET') {
      const { query } = req.query;
      const products = await getProducts(session, query);
      return res.status(200).json({ products });
    } 
    
    // Handle POST /api/products/:id/engraving
    if (req.method === 'POST' && req.query.id) {
      const { enabled } = req.body;
      if (typeof enabled !== 'boolean') {
        return res.status(400).json({ error: 'Missing or invalid enabled parameter' });
      }
      
      await toggleProductEngraving(session, req.query.id, enabled);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: error.response?.body || error.stack
    });
  }
}
