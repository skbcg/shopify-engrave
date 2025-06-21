/**
 * Shopify Theme Embed Script
 * 
 * This script should be added to your Shopify theme's theme.liquid file
 * just before the closing </head> tag.
 * 
 * It will load the engraving component on product pages only.
 */

(function() {
  // Only run on product pages
  if (!document.querySelector('body.template-product, body.product-template')) {
    return;
  }

  // Configuration
  const CONFIG = {
    appUrl: 'https://your-app-url.com', // Replace with your app's URL
    version: '1.0.0',
    paths: {
      css: '/apps/engraving/css/engraving.css',
      js: '/apps/engraving/js/engraving.js',
      injector: '/apps/engraving/js/inject-engraving.js'
    },
    features: {
      dynamicPricing: true,
      variantSupport: true,
      themeDetection: true
    }
  };

  // Create a unique ID for this script instance
  const scriptId = 'engraving-theme-embed';
  
  // Don't load if already injected
  if (document.getElementById(scriptId)) {
    return;
  }

  // Create the script element
  const script = document.createElement('script');
  script.id = scriptId;
  script.type = 'text/javascript';
  script.async = true;
  
  // Set the source to the injector script
  script.src = `${CONFIG.appUrl}${CONFIG.paths.injector}?v=${CONFIG.version}`;
  
  // Add error handling
  script.onerror = function() {
    console.error('[Engraving] Failed to load engraving component');
  };
  
  // Add load event to ensure the script loaded correctly
  script.onload = function() {
    console.log('[Engraving] Component loader initialized');
  };
  
  // Add the script to the document
  document.head.appendChild(script);
  
  // Preload CSS for better performance
  const preloadLink = document.createElement('link');
  preloadLink.rel = 'preload';
  preloadLink.href = `${CONFIG.appUrl}${CONFIG.paths.css}?v=${CONFIG.version}`;
  preloadLink.as = 'style';
  preloadLink.onload = "this.rel='stylesheet'";
  document.head.appendChild(preloadLink);
  
  console.log('[Engraving] Embed script loaded');
})();
