# Shopify Engraving App - Merchant Documentation

## Features
- Add custom engraving options to products
- Charge an additional fee for engraving
- View engraving details in the order admin
- Include engraving information on packing slips

## Installation

### 1. Install the App
1. Go to your Shopify admin
2. Navigate to "Apps" > "App and sales channel settings"
3. Click "Develop apps" (you need admin permissions)
4. Click "Create an app"
5. Enter a name for your app and click "Create app"
6. In the app setup, configure the following:
   - App URL: `https://your-app-url.com` (update after deployment)
   - Allowed redirection URL(s): `https://your-app-url.com/auth/callback`
   - Required scopes: `write_products`, `write_orders`, `write_draft_orders`

### 2. Deploy the App
Choose one of the following deployment options:

#### Option A: Deploy to Vercel (Recommended)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fshopify-engraving-app&env=SHOPIFY_API_KEY,SHOPIFY_API_SECRET,HOST&project-name=shopify-engraving-app&repository-name=shopify-engraving-app)

#### Option B: Manual Deployment
1. Clone the repository to your server
2. Run `npm install`
3. Create a `.env` file with your credentials:
   ```
   SHOPIFY_API_KEY=your_api_key
   SHOPIFY_API_SECRET=your_api_secret
   HOST=https://your-app-url.com
   ```
4. Start the server: `npm start`

## Configuration

### 1. Set Up Engraving on Products
1. Go to Products in your Shopify admin
2. Edit a product
3. In the "Variants" section, ensure you have a variant for the engraved version
4. Add a metafield to products that support engraving:
   - Namespace: `custom`
   - Key: `engraving_enabled`
   - Value: `true`
   - Type: `boolean`

### 2. Configure Order Notifications
1. Go to Settings > Notifications
2. Edit the "Order confirmation" and "Shipping confirmation" emails
3. Add liquid code to include engraving details:
   ```liquid
   {% for line_item in line_items %}
     {% if line_item.properties.engraving %}
       <p><strong>Engraving:</strong> {{ line_item.properties.engraving }}</p>
     {% endif %}
   {% endfor %}
   ```

## Viewing Engraving Details

### In Order Admin
Engraving details will automatically appear below each product in the order that has engraving.

### On Packing Slips
Engraving details are automatically included on packing slips for products that have them.

## Troubleshooting

### Engraving Option Not Showing
1. Ensure the product has the `custom.engraving_enabled` metafield set to `true`
2. Check the browser console for any JavaScript errors
3. Verify the app is properly installed and running

### Pricing Not Updating
1. Clear your browser cache
2. Ensure the variant prices are set correctly in Shopify
3. Check the network tab in developer tools for API errors

## Support
For additional help, please contact support@yourapp.com or visit our [help center](https://help.yourapp.com).
