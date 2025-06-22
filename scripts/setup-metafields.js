// setup-metafields.js
// This script sets up the required metafields for the engraving app
// Run with: node scripts/setup-metafields.js

require('dotenv').config();
const { GraphQLClient, gql } = require('graphql-request');

// Replace with your Shopify store domain and access token
const shopifyDomain = process.env.SHOP || 'your-store.myshopify.com';
const accessToken = process.env.SHOPIFY_API_ACCESS_TOKEN;

if (!accessToken) {
  console.error('Error: SHOPIFY_API_ACCESS_TOKEN not found in .env file');
  process.exit(1);
}

const endpoint = `https://${shopifyDomain}/admin/api/2024-01/graphql.json`;

const graphQLClient = new GraphQLClient(endpoint, {
  headers: {
    'X-Shopify-Access-Token': accessToken,
    'Content-Type': 'application/json',
  },
});

// Define metafield definitions
async function createMetafieldDefinitions() {
  const mutation = gql`
    mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
      metafieldDefinitionCreate(definition: $definition) {
        createdDefinition {
          id
          name
          namespace
          key
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  // Create 'enabled' metafield (boolean)
  try {
    const enabledVariables = {
      definition: {
        name: "Engraving Enabled",
        namespace: "engraving",
        key: "enabled",
        description: "Whether engraving is enabled for this product",
        type: "boolean",
        ownerType: "PRODUCT"
      }
    };
    
    const enabledResponse = await graphQLClient.request(mutation, enabledVariables);
    console.log('Created enabled metafield definition:', enabledResponse.metafieldDefinitionCreate.createdDefinition);
  } catch (error) {
    console.error('Error creating enabled metafield definition:', error.message);
  }

  // Create 'price' metafield (integer)
  try {
    const priceVariables = {
      definition: {
        name: "Engraving Price",
        namespace: "engraving",
        key: "price",
        description: "Price in cents for engraving this product",
        type: "number_integer",
        ownerType: "PRODUCT"
      }
    };
    
    const priceResponse = await graphQLClient.request(mutation, priceVariables);
    console.log('Created price metafield definition:', priceResponse.metafieldDefinitionCreate.createdDefinition);
  } catch (error) {
    console.error('Error creating price metafield definition:', error.message);
  }
}

// Enable engraving for a specific product
async function enableEngravingForProduct(productId, price = 1000) {
  const mutation = gql`
    mutation SetProductMetafields($productId: ID!, $metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields {
          id
          namespace
          key
          value
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    productId: `gid://shopify/Product/${productId}`,
    metafields: [
      {
        namespace: "engraving",
        key: "enabled",
        value: "true",
        type: "boolean",
        ownerId: `gid://shopify/Product/${productId}`
      },
      {
        namespace: "engraving",
        key: "price",
        value: price.toString(),
        type: "number_integer",
        ownerId: `gid://shopify/Product/${productId}`
      }
    ]
  };

  try {
    const response = await graphQLClient.request(mutation, variables);
    console.log(`Engraving enabled for product ${productId} with price ${price} cents`);
    return response;
  } catch (error) {
    console.error(`Error enabling engraving for product ${productId}:`, error.message);
    return null;
  }
}

// Get all products
async function getAllProducts() {
  const query = gql`
    query GetProducts {
      products(first: 50) {
        edges {
          node {
            id
            title
            handle
          }
        }
      }
    }
  `;

  try {
    const response = await graphQLClient.request(query);
    return response.products.edges.map(edge => ({
      id: edge.node.id.split('/').pop(),
      title: edge.node.title,
      handle: edge.node.handle
    }));
  } catch (error) {
    console.error('Error fetching products:', error.message);
    return [];
  }
}

// Main function
async function main() {
  // Create metafield definitions if they don't exist
  await createMetafieldDefinitions();
  
  // Get all products
  const products = await getAllProducts();
  
  if (products.length === 0) {
    console.log('No products found');
    return;
  }
  
  console.log('\nAvailable products:');
  products.forEach((product, index) => {
    console.log(`${index + 1}. ${product.title} (ID: ${product.id})`);
  });
  
  // If running interactively, you could prompt for product selection here
  // For now, just log instructions
  console.log('\nTo enable engraving for a specific product, run:');
  console.log('node scripts/setup-metafields.js enable PRODUCT_ID [PRICE_IN_CENTS]');
  console.log('Example: node scripts/setup-metafields.js enable 123456789 1500');
}

// Command line handling
if (process.argv[2] === 'enable' && process.argv[3]) {
  const productId = process.argv[3];
  const price = process.argv[4] ? parseInt(process.argv[4]) : 1000;
  enableEngravingForProduct(productId, price)
    .then(() => console.log('Done!'))
    .catch(err => console.error(err));
} else {
  main()
    .then(() => console.log('Done!'))
    .catch(err => console.error(err));
}
