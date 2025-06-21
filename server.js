require('dotenv').config();
const express = require('express');
const { Shopify } = require('@shopify/shopify-api');
const path = require('path');
const { setupRoutes } = require('./routes');
const { SQLiteSessionStorage } = require('@shopify/shopify-app-session-storage-sqlite');
const sqlite3 = require('sqlite3');

// Constants
const PORT = parseInt(process.env.PORT || '3000', 10);

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Initialize SQLite database for session storage
const db = new sqlite3.Database(process.env.DATABASE_URL || './engraving_app.sqlite');
const sessionStorage = new SQLiteSessionStorage(db);

// Configure Shopify API
Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
  SCOPES: process.env.SCOPES ? process.env.SCOPES.split(',') : ['write_products', 'write_orders'],
  HOST_NAME: process.env.HOST ? process.env.HOST.replace(/^https?:\/\//, '') : 'localhost:3000',
  HOST_SCHEME: process.env.HOST ? process.env.HOST.split('://')[0] : 'http',
  API_VERSION: '2024-01',
  IS_EMBEDDED_APP: true,
  SESSION_STORAGE: sessionStorage,
  IS_PRIVATE_APP: false
});

// Set up routes
setupRoutes(app, sessionStorage);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the main app HTML for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit: http://localhost:${PORT}`);
  
  if (process.env.SHOP) {
    const scopes = process.env.SCOPES || 'write_products,write_orders';
    const installUrl = `https://${process.env.SHOP}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(process.env.HOST + '/auth/callback')}`;
    console.log(`\nTo install the app, visit:`);
    console.log(installUrl);
  } else {
    console.log('\nPlease set the SHOP environment variable to your shop domain (e.g., your-store.myshopify.com)');
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
