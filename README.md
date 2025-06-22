# Shopify Engraving App

A custom Shopify app that adds engraving functionality to your products, allowing customers to add custom text to their orders with an additional fee.

## Features

- **Product-Specific Engraving**: Enable/disable engraving for individual products using metafields
- **Customizable Pricing**: Set engraving price through theme block settings or override per product with metafields
- **Theme Block Integration**: Seamlessly integrates with your Shopify theme as a theme app extension block
- **No External Database**: Uses Shopify's metafields for data storage
- **Cart Price Adjustment**: Automatically adds engraving fee to cart and displays in checkout
- **Configurable Settings**: Customize labels, pricing, and character limits through the theme editor

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later)
- [Shopify CLI](https://shopify.dev/themes/tools/cli)
- A Shopify Partner account (for app development)
- A Shopify store (development store recommended)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd shopify-engraving-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
SHOP=your-store.myshopify.com
SHOPIFY_API_ACCESS_TOKEN=your_api_access_token
HOST=https://custom-engraving-app.netlify.app
NODE_ENV=development
```

### 4. Set Up Product Metafields

Run the metafield setup script to create the necessary metafields for your products:

```bash
node scripts/setup-metafields.js
```

This script will:
- Create metafield definitions for engraving.enabled and engraving.price
- Allow you to enable engraving on specific products
- Set custom engraving prices per product

### 5. Deploy to Netlify

1. Push your code to a GitHub/GitLab repository
2. Connect the repository to Netlify
3. Set the build command to `npm run build`
4. Set the publish directory to `dist`
5. Set the environment variables in Netlify's site settings
6. Deploy the site

### 6. Install the App in Your Shopify Store

1. In your Shopify admin, go to Apps > Develop apps
2. Create a new custom app
3. Set the App URL to your Netlify URL: `https://custom-engraving-app.netlify.app`
4. Configure the redirect URLs as specified in shopify.app.toml
5. Grant the necessary API access scopes
6. Install the app on your store

### 7. Add the Engraving Block to Your Theme

1. Go to your Shopify admin > Online Store > Themes
2. Click "Customize" on your current theme
3. Navigate to the product page template
4. Add a new block and select "Engraving Block" from the app blocks section
5. Configure the block settings:
   - Checkbox Label (e.g., "Add Custom Engraving")
   - Engraving Price ($)
   - Text Field Label (e.g., "Enter Your Engraving Text")
   - Text Field Placeholder
   - Maximum Characters
   - Additional styling options
6. Save your changes

## Usage

### For Store Owners

1. **Configure Block Settings**:
   - In the theme editor, configure the engraving block settings
   - Set the engraving price, labels, and character limits
   - Save your theme changes

2. **Enable Engraving for Products**:
   - Run the setup-metafields.js script
   - Follow the prompts to enable engraving on specific products
   - Set custom engraving prices per product if needed

### For Customers

1. **On Product Page**:
   - Check the "Add Custom Engraving" checkbox
   - Enter the desired engraving text
   - The price will update to include the engraving fee

2. **At Checkout**:
   - The engraving text will be visible in the cart
   - The additional fee will be included in the order total
   - The engraving details will be visible in the order confirmation

## Development

### Running Locally

```bash
npm run dev
```

### Testing the App

1. Make sure the app is deployed to Netlify
2. Verify that the theme app extension block is available in your theme editor
3. Add the engraving block to your product page
4. Test the complete workflow:
   - View a product with engraving enabled
   - Check the engraving checkbox
   - Enter engraving text
   - Add to cart
   - Verify the engraving fee is added to the cart
   - Complete checkout
   - Verify engraving details appear in the order

### Troubleshooting

- If the engraving block doesn't appear, make sure the app is properly installed
- If engraving doesn't work for a product, verify that the product has the engraving.enabled metafield set to true
- If the price doesn't update, check the block settings and ensure the price is set correctly

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Use the Shopify CLI to serve your app:
   ```bash
   shopify app serve
   ```

### Building for Production

```bash
npm run build
```

## Customization

### Styling

The app uses CSS custom properties for easy theming. You can override these in your theme's CSS:

```css
:root {
  --engraving-accent-color: #d82c2c;
  --engraving-border-color: #e1e1e1;
}
```

### Translations

To add translations, modify the `enTranslations` object in `web/src/index.jsx` or create a new language file.

## Troubleshooting

### Common Issues

1. **App Not Loading**
   - Ensure all environment variables are set correctly
   - Check the browser console for errors
   - Verify the app is installed and active in your Shopify admin

2. **Metafields Not Saving**
   - Ensure your app has the correct API scopes
   - Check the Shopify admin for any metafield validation errors

3. **Theme Integration Issues**
   - Make sure the theme app extension is properly installed
   - Clear your browser cache and refresh the page

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.
