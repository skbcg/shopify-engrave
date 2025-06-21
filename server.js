require('dotenv').config();
const express = require('express');
const { Shopify } = require('@shopify/shopify-api');
const { join } = require('path');
const { readFileSync } = require('fs');
const next = require('next');
const { setupRoutes } = require('./routes');
const { SQLiteSessionStorage } = require('@shopify/shopify-app-session-storage-sqlite');
const sqlite3 = require('sqlite3');
require('dotenv').config();

// Constants
const PORT = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';

// Initialize Express app
const app = express();

// Initialize SQLite database for session storage
const db = new sqlite3.Database(process.env.DATABASE_URL || './engraving_app.sqlite');
const sessionStorage = new SQLiteSessionStorage(db);

// Configure Shopify API
Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
  SCOPES: process.env.SCOPES ? process.env.SCOPES.split(',') : [],
  HOST_NAME: process.env.HOST ? process.env.HOST.replace(/^https?:\/\//, '') : 'localhost:3000',
  HOST_SCHEME: process.env.HOST ? process.env.HOST.split('://')[0] : 'http',
  API_VERSION: '2024-01',
  IS_EMBEDDED_APP: true,
  SESSION_STORAGE: sessionStorage,
  IS_PRIVATE_APP: false
});

// Initialize Next.js
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

// Set up middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up routes
setupRoutes(app);

// Handle all other requests with Next.js
app.all('*', (req, res) => {
  return handle(req, res);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start the server
const startServer = async () => {
  try {
    await nextApp.prepare();
    
    const server = app.listen(PORT, (err) => {
      if (err) throw err;
      console.log(`> Ready on http://localhost:${PORT}`);
      if (process.env.HOST) {
        console.log(`> App URL: ${process.env.HOST}`);
      }
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

  } catch (err) {
    console.error('Failed to start the server:', err);
    process.exit(1);
  }
};

// Start the application
startServer();

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
