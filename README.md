# Shopify Custom Engraving App

A Shopify app that allows customers to add custom engraving options to products.

## Features

- Add a custom engraving option to any product
- Set a custom price for the engraving
- View engraving details in the Shopify admin
- Simple and intuitive interface

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later)
- [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)
- A [Shopify Partner account](https://partners.shopify.com/)
- A [Netlify account](https://www.netlify.com/)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/shopify-engraving-app.git
cd shopify-engraving-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory with the following variables:

```env
SHOPIFY_API_KEY=your_shopify_api_key
SHOPIFY_API_SECRET=your_shopify_api_secret
SCOPES=write_products,write_orders,write_draft_orders,read_orders
URL=https://your-netlify-site.netlify.app
```

### 4. Deploy to Netlify

1. Push your code to a GitHub repository
2. Log in to your [Netlify dashboard](https://app.netlify.com/)
3. Click "New site from Git"
4. Select your repository
5. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `public`
6. Click "Deploy site"
7. After deployment, go to "Site settings" > "Build & deploy" > "Environment"
8. Add the environment variables from your `.env` file
9. Trigger a new deploy to apply the environment variables

### 5. Set up the app in Shopify Partner Dashboard

1. Log in to your [Shopify Partner Dashboard](https://partners.shopify.com/)
2. Go to "Apps" and click "Create app"
3. Choose "Create app manually"
4. Enter a name for your app and your contact email
5. Under "App URL", enter your Netlify site URL (e.g., `https://your-netlify-site.netlify.app`)
6. Under "Allowed redirection URL(s)", add:
   - `https://your-netlify-site.netlify.app/auth/callback`
   - `https://your-netlify-site.netlify.app/api/auth/callback`
7. Save your changes

### 6. Install the app in your Shopify store

1. In the Shopify Partner Dashboard, go to your app
2. Click "Test on development store"
3. Select your development store and click "Install app"
4. Authorize the app to install it in your store

## Development

### Running locally

1. Start the development server:

```bash
npm run dev
```

2. Use the Netlify CLI to run the Netlify Functions locally:

```bash
netlify dev
```

3. Access the app at `http://localhost:8888`

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|:--------:|:-------:|
| `SHOPIFY_API_KEY` | Your Shopify API key | ✅ | - |
| `SHOPIFY_API_SECRET` | Your Shopify API secret | ✅ | - |
| `SCOPES` | Comma-separated list of API scopes | ✅ | `write_products,write_orders` |
| `URL` | Your Netlify site URL (e.g., `https://your-site.netlify.app`) | ✅ | - |
| `NODE_ENV` | Node.js environment | ❌ | `development` |

## Project Structure

```
shopify-engraving-app/
├── netlify/
│   └── functions/         # Netlify serverless functions
│       ├── api.js         # API endpoints
│       ├── auth.js        # OAuth authentication
│       ├── install.js     # App installation
│       └── package.json   # Function dependencies
├── public/                # Static files
│   ├── css/               # CSS files
│   ├── js/                # JavaScript files
│   └── index.html         # Main HTML file
├── .env.example           # Example environment variables
├── netlify.toml           # Netlify configuration
├── package.json           # Project dependencies and scripts
└── README.md              # This file
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@example.com or open an issue in the GitHub repository.
