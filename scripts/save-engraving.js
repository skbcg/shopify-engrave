const Shopify = require('@shopify/shopify-api').Shopify;
const { Session } = require('@shopify/shopify-api/dist/auth/session');
require('dotenv').config();

/**
 * Save engraving details to an order
 * @param {string} shop - The shop domain (e.g., 'your-store.myshopify.com')
 * @param {string} accessToken - The access token for the shop
 * @param {string} orderId - The ID of the order to update
 * @param {Object} engravingDetails - The engraving details to save
 * @param {string} engravingDetails.text - The engraving text
 * @param {number} engravingDetails.price - The engraving price
 * @param {string} [engravingDetails.lineItemId] - The ID of the line item (optional)
 * @returns {Promise<Object>} - The API response
 */
async function saveEngravingToOrder(shop, accessToken, orderId, engravingDetails) {
  const client = new Shopify.Clients.Rest(shop, accessToken);
  
  try {
    // Get the existing order to check for existing note attributes
    const orderResponse = await client.get({
      path: `orders/${orderId}`,
    });
    
    const order = orderResponse.body.order;
    const noteAttributes = order.note_attributes || [];
    
    // Check if engraving note already exists
    const existingEngravingIndex = noteAttributes.findIndex(
      attr => attr.name === 'Engraving' || attr.name === 'engraving'
    );
    
    // Prepare the engraving data
    const engravingData = {
      text: engravingDetails.text,
      price: engravingDetails.price,
      line_item_id: engravingDetails.lineItemId || null,
      timestamp: new Date().toISOString()
    };
    
    // Update or add the engraving note attribute
    if (existingEngravingIndex >= 0) {
      // Update existing engraving
      noteAttributes[existingEngravingIndex] = {
        name: 'Engraving',
        value: JSON.stringify(engravingData)
      };
    } else {
      // Add new engraving
      noteAttributes.push({
        name: 'Engraving',
        value: JSON.stringify(engravingData)
      });
    }
    
    // Update the order with the new note attributes
    const updateResponse = await client.put({
      path: `orders/${orderId}`,
      data: {
        order: {
          id: orderId,
          note_attributes: noteAttributes
        }
      },
      type: 'JSON'
    });
    
    console.log(`Updated order ${orderId} with engraving details`);
    return updateResponse.body;
    
  } catch (error) {
    console.error('Error saving engraving to order:', error);
    throw error;
  }
}

/**
 * Handle the webhook for order creation
 * This function would be called when an order is created
 * @param {Object} order - The order object from the webhook
 * @param {string} shop - The shop domain
 * @param {string} accessToken - The access token for the shop
 */
async function handleOrderCreate(order, shop, accessToken) {
  try {
    console.log(`Processing order ${order.id} from ${shop}`);
    
    // Check if this order has engraving details
    const engravingNote = order.note_attributes?.find(
      attr => attr.name === 'Engraving' || attr.name === 'engraving' || attr.name === 'properties[Engraving]'
    );
    
    if (!engravingNote) {
      console.log(`No engraving details found for order ${order.id}`);
      return;
    }
    
    // Parse the engraving data
    let engravingData;
    try {
      // Check if the value is already an object or needs parsing
      engravingData = typeof engravingNote.value === 'string' 
        ? JSON.parse(engravingNote.value)
        : engravingNote.value;
    } catch (e) {
      // Handle case where value is just the text
      engravingData = {
        text: engravingNote.value,
        price: 0,
        timestamp: new Date().toISOString()
      };
    }
    
    // Save the engraving details to the order
    await saveEngravingToOrder(
      shop,
      accessToken,
      order.id,
      {
        text: engravingData.text,
        price: engravingData.price || 0,
        lineItemId: engravingData.line_item_id || null
      }
    );
    
    console.log(`Successfully processed engraving for order ${order.id}`);
    
  } catch (error) {
    console.error(`Error processing order ${order.id}:`, error);
    // In a production app, you might want to implement retry logic here
  }
}

// Example usage:
/*
(async () => {
  const shop = 'your-store.myshopify.com';
  const accessToken = 'your-access-token';
  const orderId = '1234567890';
  
  await saveEngravingToOrder(shop, accessToken, orderId, {
    text: 'Happy Birthday!',
    price: 10.00,
    lineItemId: '9876543210'
  });
})();
*/

module.exports = {
  saveEngravingToOrder,
  handleOrderCreate
};
