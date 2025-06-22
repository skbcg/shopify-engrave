# Shopify Engraving App

A custom Shopify app that adds engraving functionality to your products, allowing customers to add custom text to their orders with an additional fee.

## Features

- **Product-Specific Engraving**: Enable/disable engraving for individual products
- **Customizable Pricing**: Set a default engraving price or override per product
- **Admin Panel**: Easy-to-use interface for managing engraving settings
- **Theme Integration**: Seamlessly integrates with your Shopify theme
- **No External Database**: Uses Shopify's metafields for data storage

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
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
HOST=https://your-netlify-url.netlify.app
NODE_ENV=development
```

### 4. Deploy to Netlify

1. Push your code to a GitHub/GitLab repository
2. Connect the repository to Netlify
3. Set the environment variables in Netlify's site settings
4. Deploy the site

### 5. Install the App in Your Shopify Store

1. In your Shopify Partner Dashboard, create a new app
2. Set the App URL to your Netlify URL
3. Configure the following redirect URLs:
   - `https://your-netlify-url.netlify.app/auth/callback`
   - `https://your-netlify-url.netlify.app/auth/shopify/callback`
   - `https://your-netlify-url.netlify.app/api/auth/callback`
4. Install the app on your development store

### 6. Add the Engraving Block to Your Theme

1. Go to your Shopify admin > Online Store > Themes
2. Click "Customize" on your current theme
3. Navigate to the product page
4. Add a new block and select "Engraving Block"
5. Configure the block settings as needed
6. Save your changes

## Usage

### For Store Owners

1. **Configure Global Settings**:
   - Go to the Engraving App in your Shopify admin
   - Set the default engraving price and labels
   - Save your settings

2. **Enable Engraving for Products**:
   - Go to the Products tab in the Engraving App
   - Toggle engraving on for specific products
   - Optionally set a custom price per product

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
