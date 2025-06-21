/**
 * Product Page Engraving Injection Script
 * 
 * This script injects the custom engraving component into the product page.
 * It handles loading CSS/JS dependencies and initializing the component.
 */

(function() {
  // Configuration
  const CONFIG = {
    // Selectors for different theme variants
    THEME_SELECTORS: {
      // Dawn theme
      'dawn': {
        priceSelector: '.price__regular .price-item--regular',
        formSelector: 'form[action$="/cart/add"]',
        buttonSelector: 'button[type="submit"][name="add"]',
        priceContainer: '.price',
        variantSelectors: ['input[name="id"]', 'variant-radios input[type="radio"]']
      },
      // Debut theme
      'debut': {
        priceSelector: '.product-single__price',
        formSelector: 'form[action$="/cart/add"]',
        buttonSelector: 'button[type="submit"][name="add"]',
        priceContainer: '.product-single__price',
        variantSelectors: ['select.product-form__variants', '.swatch input']
      },
      // Minimal theme
      'minimal': {
        priceSelector: '#productPrice',
        formSelector: 'form[action$="/cart/add"]',
        buttonSelector: 'button[type="submit"][name="add"]',
        priceContainer: '.product-single__prices',
        variantSelectors: ['#productSelect', '.swatch input']
      },
      // Supply theme
      'supply': {
        priceSelector: '.product__price',
        formSelector: 'form[action$="/cart/add"]',
        buttonSelector: 'button[type="submit"][name="add"]',
        priceContainer: '.product__price',
        variantSelectors: ['#ProductSelect', '.swatch input']
      },
      // Default/fallback selectors
      'default': {
        priceSelector: '.price, [data-product-price]',
        formSelector: 'form[action$="/cart/add"]',
        buttonSelector: 'button[type="submit"][name="add"], .add-to-cart',
        priceContainer: '.product-price, [data-price-wrapper]',
        variantSelectors: ['[name="id"]', '.swatch input', '.variant-input input']
      }
    },
    
    // Default settings
    DEFAULTS: {
      engravingPrice: 10.00,
      currency: 'USD',
      maxCharacters: 50,
      enabled: true
    },
    
    // Paths to our assets
    PATHS: {
      css: '/css/engraving.css',
      js: '/js/engraving.js'
    }
  };

  // Detect the current theme
  function detectTheme() {
    const bodyClasses = document.body.className.toLowerCase();
    const themeNames = Object.keys(CONFIG.THEME_SELECTORS);
    
    // Check body classes for theme indicators
    for (const theme of themeNames) {
      if (theme !== 'default' && bodyClasses.includes(theme)) {
        console.log(`[Engraving] Detected theme: ${theme}`);
        return theme;
      }
    }
    
    // Check for theme-specific elements
    for (const theme of themeNames) {
      if (theme !== 'default') {
        const themeConfig = CONFIG.THEME_SELECTORS[theme];
        if (document.querySelector(themeConfig.priceSelector)) {
          console.log(`[Engraving] Detected theme by elements: ${theme}`);
          return theme;
        }
      }
    }
    
    console.log('[Engraving] Using default theme configuration');
    return 'default';
  }

  // Get the current theme configuration
  function getThemeConfig() {
    const theme = detectTheme();
    return {
      ...CONFIG.THEME_SELECTORS.default, // Default values
      ...CONFIG.THEME_SELECTORS[theme]   // Theme-specific overrides
    };
  }

  // Load a CSS file
  function loadCSS(url) {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (document.querySelector(`link[href="${url}"]`)) {
        return resolve();
      }
      
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.onload = resolve;
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  // Load a JavaScript file
  function loadJS(url) {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (document.querySelector(`script[src="${url}"]`)) {
        return resolve();
      }
      
      const script = document.createElement('script');
      script.src = url;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  // Initialize the engraving component
  async function initEngraving() {
    const themeConfig = getThemeConfig();
    const form = document.querySelector(themeConfig.formSelector);
    
    if (!form) {
      console.warn('[Engraving] Could not find product form');
      return;
    }
    
    try {
      // Load CSS
      await loadCSS(CONFIG.PATHS.css);
      
      // Create the engraving container
      const container = document.createElement('div');
      container.id = 'shopify-engraving-container';
      container.className = 'engraving-container';
      
      // Find the submit button to insert before it
      const submitButton = form.querySelector(themeConfig.buttonSelector);
      if (submitButton) {
        submitButton.parentNode.insertBefore(container, submitButton);
      } else {
        // Fallback: append to form
        form.appendChild(container);
      }
      
      // Initialize the engraving manager with theme-specific settings
      const settings = {
        ...CONFIG.DEFAULTS,
        theme: themeConfig
      };
      
      // Store settings in a script tag for the main script to access
      const settingsScript = document.createElement('script');
      settingsScript.type = 'application/json';
      settingsScript.id = 'engraving-settings';
      settingsScript.textContent = JSON.stringify(settings);
      document.body.appendChild(settingsScript);
      
      // Load the main script
      await loadJS(CONFIG.PATHS.js);
      
      console.log('[Engraving] Component initialized successfully');
    } catch (error) {
      console.error('[Engraving] Initialization error:', error);
    }
  }

  // Wait for the DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEngraving);
  } else {
    initEngraving();
  }
})();
