#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const envPath = path.join(__dirname, '../.env');
const defaultEnv = `# Shopify App Credentials
SHOPIFY_API_KEY=your_api_key_here
SHOPIFY_API_SECRET=your_api_secret_here
SCOPES=write_products,write_orders,read_orders
HOST=https://your-ngrok-url.ngrok.io

# Database Configuration
DATABASE_URL=./engraving_app.sqlite

# App Configuration
SESSION_SECRET=your_session_secret_here
PORT=3000
NODE_ENV=development`;

function setupEnvironment() {
  console.log('🚀 Setting up your Shopify Custom Engraving App...\n');
  
  // Check if .env file exists
  if (fs.existsSync(envPath)) {
    console.log('ℹ️  .env file already exists. Would you like to overwrite it? (y/n)');
    
    rl.question('> ', (answer) => {
      if (answer.toLowerCase() === 'y') {
        createEnvFile();
      } else {
        console.log('Skipping .env file creation.');
        rl.close();
      }
    });
  } else {
    createEnvFile();
  }
}

function createEnvFile() {
  console.log('\n🔑 Please provide the following information for your app:');
  
  const prompts = [
    { key: 'SHOPIFY_API_KEY', message: 'Enter your Shopify API Key:' },
    { key: 'SHOPIFY_API_SECRET', message: 'Enter your Shopify API Secret:' },
    { 
      key: 'SCOPES', 
      message: 'Enter required API scopes (comma-separated):',
      default: 'write_products,write_orders,read_orders'
    },
    { 
      key: 'HOST', 
      message: 'Enter your app URL (e.g., https://your-ngrok-url.ngrok.io):' 
    },
    { 
      key: 'DATABASE_URL', 
      message: 'Enter database URL (leave as default for SQLite):',
      default: './engraving_app.sqlite'
    },
    { 
      key: 'SESSION_SECRET', 
      message: 'Enter a session secret (or press Enter to generate one):',
      default: generateRandomString(32)
    },
    { 
      key: 'PORT', 
      message: 'Enter port number:',
      default: '3000'
    },
    { 
      key: 'NODE_ENV', 
      message: 'Enter environment (development/production):',
      default: 'development'
    }
  ];
  
  const envVars = {};
  let currentIndex = 0;
  
  function askQuestion() {
    if (currentIndex >= prompts.length) {
      // All questions answered, write to .env file
      writeEnvFile(envVars);
      return;
    }
    
    const current = prompts[currentIndex];
    const promptText = current.default !== undefined 
      ? `${current.message} [${current.default}] ` 
      : `${current.message} `;
    
    rl.question(promptText, (answer) => {
      const value = answer.trim() || current.default || '';
      envVars[current.key] = value;
      currentIndex++;
      askQuestion();
    });
  }
  
  askQuestion();
}

function writeEnvFile(envVars) {
  let envContent = '';
  
  // Add comments and environment variables
  envContent += '# Shopify App Credentials\n';
  envContent += `SHOPIFY_API_KEY=${envVars.SHOPIFY_API_KEY}\n`;
  envContent += `SHOPIFY_API_SECRET=${envVars.SHOPIFY_API_SECRET}\n`;
  envContent += `SCOPES=${envVars.SCOPES}\n`;
  envContent += `HOST=${envVars.HOST}\n\n`;
  
  envContent += '# Database Configuration\n';
  envContent += `DATABASE_URL=${envVars.DATABASE_URL}\n\n`;
  
  envContent += '# App Configuration\n';
  envContent += `SESSION_SECRET=${envVars.SESSION_SECRET}\n`;
  envContent += `PORT=${envVars.PORT}\n`;
  envContent += `NODE_ENV=${envVars.NODE_ENV}\n`;
  
  // Write to .env file
  fs.writeFileSync(envPath, envContent);
  
  console.log('\n✅ .env file created successfully!');
  console.log('\nNext steps:');
  console.log('1. Install dependencies: npm install');
  console.log('2. Start the development server: npm run dev');
  console.log('3. Install ngrok for local development: npm install -g ngrok');
  console.log('4. Run ngrok: ngrok http 3000');
  console.log('5. Update the HOST in .env with your ngrok URL');
  console.log('6. Install the app in your Shopify store');
  
  rl.close();
}

function generateRandomString(length) {
  return require('crypto').randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
}

// Run the setup
setupEnvironment();

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nSetup cancelled.');
  process.exit(0);
});
