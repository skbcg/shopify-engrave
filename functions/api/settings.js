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

// Get shop settings
const getSettings = async (session) => {
  try {
    const client = new shopify.clients.Rest({ session });
    
    // Get or create metafield definition
    const response = await client.get({
      path: 'metafield_definitions',
      query: {
        owner_type: 'SHOP',
        namespace: NAMESPACE,
        key: 'settings'
      }
    });

    if (response.body.metafield_definitions?.length > 0) {
      const metafield = response.body.metafield_definitions[0];
      return {
        defaultPrice: metafield.default_price || 10.00,
        defaultCheckboxLabel: metafield.default_checkbox_label || 'Add Custom Engraving',
        defaultTextLabel: metafield.default_text_label || 'Engraving Text',
        defaultPlaceholder: metafield.default_placeholder || 'Enter your engraving text here (max 100 characters)',
        maxCharacters: metafield.max_characters || 100
      };
    }

    // Return default settings if no settings found
    return {
      defaultPrice: 10.00,
      defaultCheckboxLabel: 'Add Custom Engraving',
      defaultTextLabel: 'Engraving Text',
      defaultPlaceholder: 'Enter your engraving text here (max 100 characters)',
      maxCharacters: 100
    };
  } catch (error) {
    console.error('Error getting settings:', error);
    throw error;
  }
};

// Save shop settings
const saveSettings = async (session, settings) => {
  try {
    const client = new shopify.clients.Rest({ session });
    
    // Create or update metafield definition
    await client.post({
      path: 'metafield_definitions',
      data: {
        metafield_definition: {
          name: 'Engraving Settings',
          namespace: NAMESPACE,
          key: 'settings',
          type: 'json',
          owner_type: 'SHOP',
          default_price: parseFloat(settings.defaultPrice) || 10.00,
          default_checkbox_label: settings.defaultCheckboxLabel || 'Add Custom Engraving',
          default_text_label: settings.defaultTextLabel || 'Engraving Text',
          default_placeholder: settings.defaultPlaceholder || 'Enter your engraving text here (max 100 characters)',
          max_characters: parseInt(settings.maxCharacters, 10) || 100
        }
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error saving settings:', error);
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

    if (req.method === 'GET') {
      const settings = await getSettings(session);
      return res.status(200).json({ settings });
    } 
    
    if (req.method === 'POST') {
      await saveSettings(session, req.body);
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
