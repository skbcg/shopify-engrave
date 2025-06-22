import React from 'react';
import ReactDOM from 'react-dom';
import { AppProvider } from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';
import { Provider as AppBridgeProvider } from '@shopify/app-bridge-react';
import App from './App';

const config = {
  apiKey: process.env.SHOPIFY_API_KEY,
  host: new URLSearchParams(location.search).get('host'),
  forceRedirect: true
};

function WrappedApp() {
  return (
    <AppBridgeProvider config={config}>
      <AppProvider i18n={enTranslations}>
        <App />
      </AppProvider>
    </AppBridgeProvider>
  );
}

const root = document.getElementById('app');
ReactDOM.render(<WrappedApp />, root);
