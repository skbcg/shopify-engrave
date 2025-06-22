# Shopify Engraving App Deployment Checklist

This document provides a step-by-step checklist for deploying the Shopify Engraving App to Netlify.

## Pre-Deployment Checklist

- [x] Update app URLs in `shopify.app.toml` (completed)
- [x] Configure theme app extension block schema (completed)
- [x] Implement cart price adjustment for engraving fee (completed)
- [x] Create metafield setup script (completed)
- [x] Update Netlify configuration in `netlify.toml` (completed)

## Deployment Steps

1. **Prepare Environment Variables**

   Create a `.env` file on Netlify with the following variables:
   ```
   SHOP=your-store.myshopify.com
   SHOPIFY_API_ACCESS_TOKEN=your_api_access_token
   HOST=https://custom-engraving-app.netlify.app
   ```

2. **Connect to Netlify**

   ```bash
   # Install Netlify CLI if not already installed
   npm install netlify-cli -g
   
   # Login to Netlify
   netlify login
   
   # Initialize Netlify site
   netlify init
   ```

3. **Deploy to Netlify**

   ```bash
   # Deploy to Netlify
   netlify deploy --prod
   ```

4. **Set Up Metafields**

   After deployment, run the metafield setup script:
   ```bash
   node scripts/setup-metafields.js
   ```

## Post-Deployment Checklist

- [ ] Verify app is accessible at `https://custom-engraving-app.netlify.app`
- [ ] Confirm theme app extension block is available in theme editor
- [ ] Test engraving functionality on product page
- [ ] Verify cart price adjustment works correctly
- [ ] Test checkout process with engraving
- [ ] Confirm engraving details appear in order details

## Troubleshooting

- **Theme App Extension Not Appearing**: Ensure the app is properly installed and the extension is published
- **Engraving Not Working**: Check that product metafields are properly set up
- **Price Not Updating**: Verify block settings and JavaScript functionality
- **API Errors**: Check environment variables and API access token permissions

## Maintenance

- Update the app as needed by pushing changes to your repository
- Netlify will automatically rebuild and deploy on push
- Monitor app usage and performance through Netlify analytics
