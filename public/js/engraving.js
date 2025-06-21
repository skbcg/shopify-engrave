/**
 * Engraving Manager for Shopify Product Pages
 * 
 * Handles the custom engraving functionality including UI, pricing, and order attributes
 * @class EngravingManager
 */
class EngravingManager {
  /**
   * Create a new EngravingManager instance
   * @param {Object} options - Configuration options
   * @param {number} [options.engravingPrice=10.00] - Price to add for engraving
   * @param {string} [options.currency='USD'] - Currency code
   * @param {number} [options.maxCharacters=30] - Maximum characters allowed for engraving
   * @param {boolean} [options.enabled=true] - Whether engraving is enabled
   * @param {string} [options.apiEndpoint] - API endpoint for saving engravings
   * @param {string} [options.settingsEndpoint] - API endpoint for fetching settings
   * @param {boolean} [options.debug=false] - Debug mode
   * @param {boolean} [options.saveToCartAsync=true] - Whether to use AJAX for cart updates
   * @param {boolean} [options.showCharacterCount=true] - Show character counter
   * @param {boolean} [options.showPriceBreakdown=true] - Show price breakdown
   * @param {boolean} [options.autoScrollToEngraving=true] - Auto-scroll to engraving section when expanded
   * @param {number} [options.scrollOffset=20] - Pixels to offset scroll position
   * @param {number} [options.priceUpdateDebounce=100] - ms to debounce price updates
   * @param {number} [options.variantChangeDebounce=150] - ms to debounce variant changes
   */
  constructor(options = {}) {
    // Default settings
    this.settings = {
      engravingPrice: 10.00, // Default price for engraving
      maxCharacters: 30, // Default max characters for engraving
      currency: 'USD', // Default currency
      debug: false, // Debug mode
      saveToCartAsync: true, // Whether to use AJAX for cart updates
      showCharacterCount: true, // Show character counter
      showPriceBreakdown: true, // Show price breakdown
      autoScrollToEngraving: true, // Auto-scroll to engraving section when expanded
      scrollOffset: 20, // Pixels to offset scroll position
      priceUpdateDebounce: 100, // ms to debounce price updates
      variantChangeDebounce: 150, // ms to debounce variant changes
      ...options // User-provided options override defaults
    };
    
    // Application state
    this.state = {
      isEngravingSelected: false,
      engravingText: '',
      originalPrice: 0,
      variantId: null,
      error: null,
      isLoading: false,
      isInitialized: false,
      cartUpdated: false,
      events: [] // Keep track of dispatched events for debugging
    };
    
    // DOM elements cache
    this.elements = {
      engravingContainer: null,
      engravingCheckbox: null,
      engravingTextarea: null,
      characterCount: null,
      errorContainer: null,
      priceContainer: null,
      priceBreakdown: null,
      originalPriceElement: null,
      engravingPriceElement: null,
      totalPriceElement: null
    };
    
    // Timeouts and intervals
    this.timeouts = {
      priceUpdate: null,
      variantChange: null,
      errorHide: null,
      scrollCheck: null
    };
    
    // Observers
    this.observers = {
      price: null,
      mutations: null,
      intersection: null
    };
    
    // Event handlers (for cleanup)
    this.eventHandlers = [];
    
    // Bind methods
    this.initialize = this.initialize.bind(this);
    this.addEngravingUI = this.addEngravingUI.bind(this);
    this.toggleEngraving = this.toggleEngraving.bind(this);
    this.updateEngravingText = this.updateEngravingText.bind(this);
    this.updateCharacterCount = this.updateCharacterCount.bind(this);
    this.updatePrice = this.updatePrice.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.addEngravingToForm = this.addEngravingToForm.bind(this);
    this.saveEngravingToCart = this.saveEngravingToCart.bind(this);
    this.getSelectedVariantId = this.getSelectedVariantId.bind(this);
    this.cacheOriginalPrice = this.cacheOriginalPrice.bind(this);
    this.setupPriceObserver = this.setupPriceObserver.bind(this);
    this.setupVariantListener = this.setupVariantListener.bind(this);
    this.formatPrice = this.formatPrice.bind(this);
    this.showError = this.showError.bind(this);
    this.hideError = this.hideError.bind(this);
    this.dispatchEvent = this.dispatchEvent.bind(this);
    this.cleanup = this.cleanup.bind(this);
    this.scrollToEngraving = this.scrollToEngraving.bind(this);
    this.log = this.log.bind(this);
    this.warn = this.warn.bind(this);
    this.error = this.error.bind(this);
    
    // Initialize debug logging if enabled
    if (this.settings.debug) {
      console.log('EngravingManager initialized with settings:', this.settings);
    }
    
    // Initialize
    if (document.readyState === 'loading') {
      this.addEventHandler(document, 'DOMContentLoaded', this.initialize);
    } else {
      // Small delay to ensure all other scripts have loaded
      setTimeout(this.initialize, 100);
    }
  }

  /**
   * Initialize the engraving functionality
   * @async
   */
  async initialize() {
    if (this.state.isInitialized) {
      this.log('Already initialized, skipping...');
      return;
    }

    try {
      this.log('Initializing engraving functionality...');
      this.state.isLoading = true;
      
      // Dispatch initialization started event
      this.dispatchEvent('engraving:initializing');
      
      // Wait for the product form to be available
      await this.waitForElement('form[action*="/cart/add"]');
      
      // Cache the original product price
      this.cacheOriginalPrice();
      
      // Set up price observer
      this.setupPriceObserver();
      
      // Set up variant change listener
      this.setupVariantListener();
      
      // Add the engraving UI to the page
      await this.addEngravingUI();
      
      // Listen for form submission
      const form = document.querySelector('form[action*="/cart/add"]');
      if (form) {
        this.addEventHandler(form, 'submit', this.handleFormSubmit);
        this.log('Form submission handler attached');
      } else {
        this.warn('No product form found');
      }
      
      // Mark as initialized
      this.state.isInitialized = true;
      this.state.isLoading = false;
      
      // Dispatch initialization complete event
      this.dispatchEvent('engraving:initialized', {
        originalPrice: this.state.originalPrice,
        variantId: this.state.variantId
      });
      
      this.log('Engraving functionality initialized successfully');
      
    } catch (error) {
      this.error('Error initializing engraving:', error);
      this.state.error = error;
      this.state.isLoading = false;
      
      // Dispatch error event
      this.dispatchEvent('engraving:error', {
        message: 'Failed to initialize engraving functionality',
        error: error.message,
        type: 'initialization_error'
      });
      
      // Show error to user
      this.showError('Failed to initialize engraving functionality. Please refresh the page.');
      
      // Re-throw to allow handling by the caller if needed
      throw error;
    }
  }

  /**
   * Cache the original product price from the page
   * This ensures we always have the base price to calculate from
   */
  cacheOriginalPrice() {
    try {
      // Try to find the most appropriate price element
      const priceElements = [
        // Common Shopify price elements
        document.querySelector('.price-item--regular'),
        document.querySelector('[data-product-price]'),
        document.querySelector('.product__price'),
        document.querySelector('.price'),
        document.querySelector('.product-price__price'),
        document.querySelector('.product-single__price')
      ].filter(Boolean); // Remove null/undefined elements
      
      // If we found price elements, use the first one
      if (priceElements.length > 0) {
        // Get the first non-empty text content
        for (const element of priceElements) {
          const priceText = element.textContent.replace(/[^0-9.,]+/g, '').replace(',', '.');
          const price = parseFloat(priceText);
          
          if (!isNaN(price) && price > 0) {
            // If we have a valid price, store it and stop looking
            this.state.originalPrice = price;
            this.dispatchEvent('engraving:price-cached', { price: price });
            return;
          }
        }
      }
      
      // If we get here, we couldn't find a valid price
      console.warn('Could not determine original product price');
      this.dispatchEvent('engraving:error', { 
        message: 'Could not determine product price',
        type: 'price_not_found'
      });
      
    } catch (error) {
      console.error('Error caching original price:', error);
      this.dispatchEvent('engraving:error', { 
        message: 'Error determining product price',
        error: error.message,
        type: 'price_error'
      });
    }
  }

  /**
   * Add the engraving UI to the page
   * @returns {Promise<HTMLElement>} The created engraving container
   */
  async addEngravingUI() {
    this.log('Adding engraving UI to the page...');
    
    try {
      // Create the main container
      const container = document.createElement('div');
      container.className = 'engraving-container';
      container.id = 'engraving-container';
      container.setAttribute('data-engraving-container', 'true');
      
      // Create the checkbox section
      const checkboxContainer = document.createElement('div');
      checkboxContainer.className = 'engraving-option';
      
      // Create the checkbox input
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = 'engraving-checkbox';
      checkbox.className = 'engraving-checkbox';
      checkbox.setAttribute('aria-label', 'Add custom engraving');
      
      // Create the label for the checkbox
      const label = document.createElement('label');
      label.htmlFor = 'engraving-checkbox';
      label.className = 'engraving-label';
      
      // Create the checkbox visual (for custom styling)
      const checkboxVisual = document.createElement('span');
      checkboxVisual.className = 'engraving-checkbox-visual';
      
      // Create the label text with price
      const labelText = document.createElement('span');
      labelText.className = 'engraving-label-text';
      labelText.textContent = 'Add Custom Engraving';
      
      const priceSpan = document.createElement('span');
      priceSpan.className = 'engraving-price';
      priceSpan.textContent = ` (+${this.formatPrice(this.settings.engravingPrice)})`;
      
      labelText.appendChild(priceSpan);
      label.appendChild(checkboxVisual);
      label.appendChild(labelText);
      
      // Create the input container (initially hidden)
      const inputContainer = document.createElement('div');
      inputContainer.className = 'engraving-input-container';
      inputContainer.style.display = 'none';
      
      // Create the textarea for engraving text
      const textarea = document.createElement('textarea');
      textarea.id = 'engraving-text';
      textarea.className = 'engraving-textarea';
      textarea.placeholder = 'Enter your custom engraving text here...';
      textarea.maxLength = this.settings.maxCharacters;
      textarea.setAttribute('aria-label', 'Engraving text');
      textarea.setAttribute('rows', '3');
      
      // Create character counter
      const charCount = document.createElement('div');
      charCount.id = 'engraving-char-count';
      charCount.className = 'engraving-char-count';
      charCount.textContent = `0/${this.settings.maxCharacters} characters`;
      
      // Create price breakdown
      const priceBreakdown = document.createElement('div');
      priceBreakdown.className = 'engraving-price-breakdown';
      priceBreakdown.style.display = 'none';
      
      const originalPriceEl = document.createElement('div');
      originalPriceEl.className = 'engraving-original-price';
      originalPriceEl.textContent = `Product: ${this.formatPrice(this.state.originalPrice)}`;
      
      const engravingPriceEl = document.createElement('div');
      engravingPriceEl.className = 'engraving-fee';
      engravingPriceEl.textContent = `Engraving: +${this.formatPrice(this.settings.engravingPrice)}`;
      
      const totalPriceEl = document.createElement('div');
      totalPriceEl.className = 'engraving-total-price';
      totalPriceEl.textContent = `Total: ${this.formatPrice(this.state.originalPrice + this.settings.engravingPrice)}`;
      
      priceBreakdown.appendChild(originalPriceEl);
      priceBreakdown.appendChild(engravingPriceEl);
      priceBreakdown.appendChild(totalPriceEl);
      
      // Create error container
      const errorContainer = document.createElement('div');
      errorContainer.id = 'engraving-error';
      errorContainer.className = 'engraving-error';
      errorContainer.setAttribute('role', 'alert');
      errorContainer.setAttribute('aria-live', 'assertive');
      errorContainer.style.display = 'none';
      
      // Assemble the UI
      checkboxContainer.appendChild(checkbox);
      checkboxContainer.appendChild(label);
      
      inputContainer.appendChild(textarea);
      inputContainer.appendChild(charCount);
      
      container.appendChild(checkboxContainer);
      container.appendChild(inputContainer);
      container.appendChild(priceBreakdown);
      container.appendChild(errorContainer);
      
      // Store references to elements
      this.elements.engravingContainer = container;
      this.elements.engravingCheckbox = checkbox;
      this.elements.engravingTextarea = textarea;
      this.elements.characterCount = charCount;
      this.elements.errorContainer = errorContainer;
      this.elements.priceContainer = priceBreakdown;
      this.elements.originalPriceElement = originalPriceEl;
      this.elements.engravingPriceElement = engravingPriceEl;
      this.elements.totalPriceElement = totalPriceEl;
      
      // Add event listeners using our helper method for proper cleanup
      this.addEventHandler(checkbox, 'change', this.toggleEngraving);
      this.addEventHandler(textarea, 'input', this.updateEngravingText);
      this.addEventHandler(textarea, 'focus', () => {
        container.classList.add('engraving-focused');
      });
      this.addEventHandler(textarea, 'blur', () => {
        container.classList.remove('engraving-focused');
      });
      
      // Find the best place to insert the engraving UI
      const insertionPoint = this.findEngravingInsertionPoint();
      if (insertionPoint) {
        insertionPoint.parentNode.insertBefore(container, insertionPoint);
        this.log('Engraving UI inserted before', insertionPoint);
      } else {
        // Fallback to product form or body
        const form = document.querySelector('form[action*="/cart/add"]');
        if (form) {
          form.insertBefore(container, form.firstChild);
          this.log('Engraving UI inserted at the beginning of the form');
        } else {
          document.body.appendChild(container);
          this.warn('Could not find form, appended engraving UI to body');
        }
      }
      
      // Add CSS class to body to enable theme-specific styling
      document.documentElement.classList.add('has-engraving');
      
      // Dispatch event that UI is ready
      this.dispatchEvent('engraving:ui-ready', {
        container: container,
        isEnabled: this.state.isEngravingSelected
      });
      
      this.log('Engraving UI added successfully');
      return container;
      
    } catch (error) {
      this.error('Error adding engraving UI:', error);
      this.dispatchEvent('engraving:error', {
        message: 'Failed to initialize engraving UI',
        error: error.message,
        type: 'ui_error'
      });
      throw error;
    }
  }
  
  /**
   * Find the best place to insert the engraving UI
   * @returns {HTMLElement|null} The element to insert before, or null if not found
   */
  findEngravingInsertionPoint() {
    // Common selectors for elements that often precede the add to cart button
    const selectors = [
      // Quantity selectors
      '.product-form__quantity',
      '.quantity-selector',
      '.product-quantity',
      // Variant selectors
      '.product-options',
      '.product-variants',
      '.selector-wrapper',
      // Common before-button elements
      '.product-add',
      '.product-actions',
      '.product-form__buttons',
      // The add to cart button itself (we'll insert before it)
      'button[type="submit"][name="add"]',
      'input[type="submit"][value="Add to cart"]',
      '.add-to-cart',
      '.product-form__submit',
      // Payment buttons (Shopify's dynamic checkout)
      '.shopify-payment-button',
      // Last resort: any submit button in the form
      'form[action*="/cart/add"] [type="submit"]'
    ];
    
    // Try each selector until we find a match
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        this.log(`Found insertion point with selector: ${selector}`);
        return element;
      }
    }
    
    this.warn('Could not find an appropriate insertion point for engraving UI');
    return null;
  }
    
  /**
   * Hide the loading state and show the content
   */
  hideLoading() {
    if (this.elements.loading) {
      this.elements.loading.style.display = 'none';
    }
    if (this.elements.content) {
      this.elements.content.style.display = 'block';
    }
  }

  /**
   * Set up event listeners for the engraving component
   */
  setupEventListeners() {
    if (!this.elements) return;
    
    // Toggle engraving on checkbox change
    this.elements.checkbox.addEventListener('change', (e) => {
      this.toggleEngraving(e.target.checked);
    });
    
    // Update text and character count on input
    this.elements.textarea.addEventListener('input', (e) => {
      const text = e.target.value;
      this.updateEngravingText(text);
      this.updateCharacterCount(text.length);
    });
    
    // Handle form submission
    if (this.form) {
      this.form.addEventListener('submit', this.handleFormSubmit.bind(this));
    }
  }
  
  /**
   * Toggle the engraving option
   * @param {boolean} selected - Whether engraving is selected
   */
  toggleEngraving(selected) {
    if (!this.elements) return;
    
    this.state.isEngravingSelected = selected;
    
    try {
      if (selected) {
        // Show the engraving input container
        this.elements.container.classList.add('engraving-selected');
        
        // Set focus to the textarea
        setTimeout(() => {
          if (this.elements.textarea) {
            this.elements.textarea.focus();
          }
        }, 50);
        
        // Update the price to include engraving
        this.updatePrice(true);
        
        // Dispatch event
        this.dispatchEvent('engraving:selected', { selected: true });
      } else {
        // Hide the engraving input container
        this.elements.container.classList.remove('engraving-selected');
        
        // Clear the text when unchecking
        if (this.elements.textarea) {
          this.elements.textarea.value = '';
        }
        this.updateEngravingText('');
        this.updateCharacterCount(0);
        
        // Update the price to exclude engraving
        this.updatePrice(false);
        
        // Clear any previous errors
        this.clearError();
        
        // Dispatch event
        this.dispatchEvent('engraving:selected', { selected: false });
      }
    } catch (error) {
      console.error('Error toggling engraving:', error);
      this.showError('Failed to update engraving option. Please try again.');
    }
  }

  /**
   * Update the engraving text
   * @param {string} text - The engraving text to set
   */
  updateEngravingText(text) {
    if (!text) {
      this.state.engravingText = '';
      return;
    }
    
    try {
      // Truncate text to max characters
      const truncatedText = text.substring(0, this.settings.maxCharacters);
      this.state.engravingText = truncatedText;
      
      // Update the textarea value if it exists and doesn't match
      if (this.elements?.textarea && this.elements.textarea.value !== truncatedText) {
        this.elements.textarea.value = truncatedText;
      }
      
      // Dispatch event
      this.dispatchEvent('engraving:text-updated', { 
        text: truncatedText,
        length: truncatedText.length,
        maxLength: this.settings.maxCharacters
      });
      
    } catch (error) {
      console.error('Error updating engraving text:', error);
      this.showError('Failed to update engraving text.');
    }
  }
  
  /**
   * Update the character count display
   * @param {number} count - Current character count
   */
  updateCharacterCount(count) {
    if (!this.elements?.charCount) return;
    
    try {
      const remaining = this.settings.maxCharacters - count;
      this.elements.charCount.textContent = `${count}/${this.settings.maxCharacters} characters`;
      
      // Add warning class when approaching limit
      if (remaining < 10) {
        this.elements.charCount.classList.add('warning');
      } else {
        this.elements.charCount.classList.remove('warning');
      }
      
      // Dispatch event
      this.dispatchEvent('engraving:character-count', { 
        count,
        remaining,
        maxLength: this.settings.maxCharacters
      });
      
    } catch (error) {
      console.error('Error updating character count:', error);
    }
  }

  /**
   * Update the price display to include engraving cost
   * @param {boolean} includeEngraving - Whether to include the engraving price
   */
  updatePrice(includeEngraving) {
    try {
      // If we don't have a valid original price, try to get it
      if (this.state.originalPrice <= 0) {
        this.cacheOriginalPrice();
      }
      
      // If still no valid price, show an error and bail
      if (this.state.originalPrice <= 0) {
        console.warn('No valid original price available for update');
        this.showError('Could not determine product price. Please refresh the page.');
        return;
      }
      
      // Calculate the new price
      const engravingPrice = includeEngraving ? this.settings.engravingPrice : 0;
      const newPrice = this.state.originalPrice + engravingPrice;
      const formattedPrice = this.formatPrice(newPrice);
      const formattedEngravingPrice = this.formatPrice(engravingPrice);
      
      // Common price element selectors across Shopify themes
      const priceSelectors = [
        // Regular price elements
        '.price-item--regular',
        '[data-product-price]',
        '.product__price',
        '.price',
        '.product-price__price',
        '.product-single__price',
        // Common price containers
        '.product-price',
        '.product-item__price',
        '.product-card__price',
        '.grid-product__price',
        // Price in forms and buttons
        '.product-form__price',
        '.add-to-cart .price',
        // Price in cart
        '.cart__price',
        '.cart-item__price',
        // Price in product listings
        '.grid__item .price',
        // Price in featured products
        '.featured-product__price',
        // Price in quick view
        '.quick-product__price',
        // Price in cart drawer
        '.drawer__cart .price'
      ];
      
      // Find all unique price elements
      const allPriceElements = [];
      const seenElements = new Set();
      
      priceSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
          if (!seenElements.has(element)) {
            seenElements.add(element);
            allPriceElements.push(element);
          }
        });
      });
      
      if (allPriceElements.length === 0) {
        console.warn('No price elements found to update');
        return;
      }
      
      // Update each price element
      allPriceElements.forEach(element => {
        try {
          // Skip elements that are in sale price containers
          if (element.closest('.price__sale, .product-price__sale, .price--sale, .sale-price, .compare-at-price')) {
            return;
          }
          
          // Skip elements that are explicitly marked as compare-at prices
          if (element.matches('.price-item--compare, .product__compare-price, .compare-price, .was-price, .saved-amount')) {
            return;
          }
          
          // Update the price display
          if (element.matches('input, textarea, select')) {
            element.value = newPrice;
          } else {
            // Check if the element has a data attribute for the price
            const priceAttr = element.getAttribute('data-product-price') || 
                            element.getAttribute('data-price') ||
                            element.getAttribute('data-amount');
                            
            if (priceAttr) {
              element.setAttribute('data-product-price', newPrice);
              element.textContent = formattedPrice;
            } else if (element.textContent.trim() !== '') {
              // Only update if the element has content
              element.textContent = formattedPrice;
            }
          }
          
          // Update data attributes
          if (element.hasAttribute('data-product-price')) {
            element.setAttribute('data-product-price', newPrice);
          }
          
          // Mark that we've updated this element to prevent loops
          element.setAttribute('data-engraving-updated', 'true');
          
        } catch (error) {
          console.error('Error updating price element:', error, element);
        }
      });
      
      // Dispatch a custom event with price details
      this.dispatchEvent('engraving:price-updated', {
        originalPrice: this.state.originalPrice,
        engravingPrice: engravingPrice,
        totalPrice: newPrice,
        formattedPrice: formattedPrice,
        formattedEngravingPrice: formattedEngravingPrice,
        updatedElements: allPriceElements.length
      });
      
      // Log the update
      console.log(`Price updated: ${this.formatPrice(this.state.originalPrice)} + ${formattedEngravingPrice} = ${formattedPrice}`);
      
    } catch (error) {
      console.error('Error updating price:', error);
      this.dispatchEvent('engraving:error', {
        message: 'Failed to update price display',
        error: error.message,
        type: 'price_update_error'
      });
    }
  }
  
  /**
   * Show a loading state in the UI
   */
  showLoading() {
    if (!this.elements) return;
    
    try {
      if (this.elements.loading) this.elements.loading.style.display = 'block';
      if (this.elements.content) this.elements.content.style.display = 'none';
      this.clearError();
    } catch (error) {
      console.error('Error showing loading state:', error);
    }
  }
  
  /**
   * Hide the loading state and show the content
   */
  hideLoading() {
    if (!this.elements) return;
    
    try {
      if (this.elements.loading) this.elements.loading.style.display = 'none';
      if (this.elements.content) this.elements.content.style.display = 'block';
    } catch (error) {
      console.error('Error hiding loading state:', error);
    }
  }
  
  /**
   * Show an error message to the user
   * @param {string} message - The error message to display
   */
  showError(message) {
    if (!this.elements?.errorContainer) return;
    
    try {
      this.state.error = message;
      this.elements.errorContainer.textContent = message;
      this.elements.errorContainer.style.display = 'block';
      
      // Auto-hide error after 10 seconds
      if (this.errorTimeout) clearTimeout(this.errorTimeout);
      this.errorTimeout = setTimeout(() => {
        this.clearError();
      }, 10000);
      
      // Dispatch event
      this.dispatchEvent('engraving:error', { message });
      
    } catch (error) {
      console.error('Error showing error message:', error);
    }
  }
  
  /**
   * Clear any displayed error messages
   */
  clearError() {
    if (!this.elements?.errorContainer) return;
    
    try {
      this.state.error = null;
      this.elements.errorContainer.textContent = '';
      this.elements.errorContainer.style.display = 'none';
      
      if (this.errorTimeout) {
        clearTimeout(this.errorTimeout);
        this.errorTimeout = null;
      }
      
      // Dispatch event
      this.dispatchEvent('engraving:error-cleared');
      
    } catch (error) {
      console.error('Error clearing error message:', error);
    }
  }
  
  /**
   * Dispatch a custom event
   * @param {string} eventName - The name of the event
   * @param {Object} [detail] - Optional event data
   */
  dispatchEvent(eventName, detail = {}) {
    try {
      const event = new CustomEvent(eventName, {
        detail: {
          ...detail,
          timestamp: new Date().toISOString(),
          instance: this
        },
        bubbles: true,
        cancelable: true
      });
      
      // Dispatch on both the document and the container element
      document.dispatchEvent(event);
      if (this.elements?.container) {
        this.elements.container.dispatchEvent(event);
      }
      
    } catch (error) {
      console.error(`Error dispatching event ${eventName}:`, error);
    }
  }

  /**
   * Add an event handler with automatic cleanup tracking
   * @param {Element} element - DOM element to attach the event to
   * @param {string} event - Event name
   * @param {Function} handler - Event handler function
   * @param {Object} [options] - Event listener options
   */
  addEventHandler(element, event, handler, options) {
    element.addEventListener(event, handler, options);
    this.eventHandlers.push({ element, event, handler, options });
  }

  /**
   * Remove all registered event handlers
   */
  removeAllEventHandlers() {
    this.eventHandlers.forEach(({ element, event, handler, options }) => {
      element.removeEventListener(event, handler, options);
    });
    this.eventHandlers = [];
  }

  /**
   * Log a debug message if debug mode is enabled
   * @param {...any} args - Arguments to log
   */
  log(...args) {
    if (this.settings.debug) {
      console.log('%c[EngravingManager]', 'color: #4CAF50; font-weight: bold;', ...args);
    }
  }

  /**
   * Log a warning message
   * @param {...any} args - Arguments to log
   */
  warn(...args) {
    console.warn('%c[EngravingManager]', 'color: #FFC107; font-weight: bold;', ...args);
  }

  /**
   * Log an error message
   * @param {...any} args - Arguments to log
   */
  error(...args) {
    console.error('%c[EngravingManager]', 'color: #F44336; font-weight: bold;', ...args);
  }

  /**
   * Clean up all event listeners and observers
   */
  cleanup() {
    this.log('Cleaning up...');
    
    // Clear all timeouts
    Object.values(this.timeouts).forEach(timeout => {
      if (timeout) clearTimeout(timeout);
    });
    
    // Disconnect all observers
    Object.values(this.observers).forEach(observer => {
      if (observer) observer.disconnect();
    });
    
    // Remove all event listeners
    this.removeAllEventHandlers();
    
    // Reset state
    this.state.isInitialized = false;
    this.state.isLoading = false;
    
    this.log('Cleanup complete');
  }

  /**
   * Scroll to the engraving section
   */
  scrollToEngraving() {
    if (!this.elements.engravingContainer || !this.settings.autoScrollToEngraving) return;
    
    const rect = this.elements.engravingContainer.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const offset = this.settings.scrollOffset || 0;
    
    window.scrollTo({
      top: rect.top + scrollTop - offset,
      left: rect.left + scrollLeft,
      behavior: 'smooth'
    });
  }

  /**
   * Format a price with the specified currency
   * @param {number} price - The price to format
   * @param {string} [currency] - Currency code (defaults to settings.currency)
   * @returns {string} Formatted price string
   */
  formatPrice(price, currency) {
    const currencyCode = currency || this.settings.currency || 'USD';
    
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(price);
    } catch (error) {
      this.error('Error formatting price:', error);
      return `${currencyCode} ${price.toFixed(2)}`;
    }
  }

  /**
   * Set up a mutation observer to watch for price changes
   * This helps ensure the engraving price stays in sync with the base price
   */
  setupPriceObserver() {
    try {
      // Try to find all possible price elements
      const priceSelectors = [
        '.price-item--regular',
        '[data-product-price]',
        '.product__price',
        '.price',
        '.product-price__price',
        '.product-single__price',
        '.product-single__price--compare',
        '.product__price--compare',
        '.price--on-sale',
        '.price-item--sale',
        '.price__sale',
        '.product-price__sale',
        '.product__price-savings',
        '.savings',
        '.sale-price',
        '.compare-price',
        '.product-price__regular',
        '.product__price-item--regular'
      ];
      
      // Create a single observer for all price elements
      const observer = new MutationObserver((mutationsList) => {
        // Check if any mutations affected text content
        const shouldUpdate = mutationsList.some(mutation => 
          mutation.type === 'characterData' || 
          mutation.type === 'childList' ||
          (mutation.type === 'attributes' && mutation.attributeName === 'class')
        );
        
        if (shouldUpdate) {
          // Debounce to avoid multiple rapid updates
          if (this.priceUpdateTimeout) {
            clearTimeout(this.priceUpdateTimeout);
          }
          
          this.priceUpdateTimeout = setTimeout(() => {
            // Get the current price from the page
            this.cacheOriginalPrice();
            
            // If engraving is selected, update the price to include it
            if (this.state.isEngravingSelected) {
              this.updatePrice(true);
            }
            
            // Dispatch an event that the price was updated
            this.dispatchEvent('engraving:price-updated', {
              originalPrice: this.state.originalPrice,
              engravingPrice: this.state.isEngravingSelected ? this.settings.engravingPrice : 0,
              totalPrice: this.state.isEngravingSelected 
                ? this.state.originalPrice + this.settings.engravingPrice 
                : this.state.originalPrice
            });
            
          }, 100); // 100ms debounce
        }
      });
      
      // Configuration for the observer
      const config = {
        characterData: true,
        attributes: true,
        childList: true,
        subtree: true,
        attributeFilter: ['class']
      };
      
      // Start observing all price elements
      priceSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          observer.observe(element, config);
        });
      });
      
      // Store the observer for later disconnection if needed
      this.priceObserver = observer;
      
      // Initial check
      this.cacheOriginalPrice();
      
    } catch (error) {
      console.error('Error setting up price observer:', error);
      this.dispatchEvent('engraving:error', {
        message: 'Error setting up price monitoring',
        error: error.message,
        type: 'observer_error'
      });
    }
  }

  /**
   * Set up listeners for variant changes
   * Handles both traditional form changes and AJAX-based variant updates
   */
  setupVariantListener() {
    try {
      // Common variant selector patterns in Shopify themes
      const variantSelectors = [
        'select[name="id"]',
        'input[name="id"]',
        '[data-product-select]',
        '[data-productid]',
        '.product-variant-select',
        '.variant-select',
        '.product-option-value',
        '.swatch',
        '.product-single__variants',
        '.product-variants',
        '.variant-input',
        '.variant-input-wrap input',
        '[data-option]',
        '.selector-wrapper select',
        '.product-option',
        '.product-option-item',
        '.product-option-value',
        '.product-options__value',
        '.product-form__input',
        '.product-option input[type="radio"]',
        '.product-option input[type="checkbox"]'
      ];
      
      // Function to handle variant changes
      const handleVariantChange = (event) => {
        // Debounce to handle rapid changes
        if (this.variantChangeTimeout) {
          clearTimeout(this.variantChangeTimeout);
        }
        
        this.variantChangeTimeout = setTimeout(() => {
          // Get the new variant ID
          const variantId = this.getSelectedVariantId();
          
          // Dispatch event before updating
          this.dispatchEvent('engraving:variant-changing', { 
            variantId: variantId,
            previousVariantId: this.state.variantId 
          });
          
          // Update the current variant ID
          this.state.variantId = variantId;
          
          // Re-cache the original price for the new variant
          this.cacheOriginalPrice();
          
          // If engraving is selected, update the price
          if (this.state.isEngravingSelected) {
            this.updatePrice(true);
          }
          
          // Dispatch event after updating
          this.dispatchEvent('engraving:variant-changed', { 
            variantId: variantId,
            price: this.state.originalPrice,
            hasEngraving: this.state.isEngravingSelected
          });
          
        }, 150); // 150ms debounce
      };
      
      // Listen for changes on all variant selectors
      variantSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          element.addEventListener('change', handleVariantChange);
          
          // For radio/checkbox inputs, also listen for clicks
          if (element.matches('input[type="radio"], input[type="checkbox"]')) {
            element.addEventListener('click', handleVariantChange);
          }
        });
      });
      
      // Listen for custom variant:change events that some themes use
      document.addEventListener('variant:change', (event) => {
        if (event.detail && event.detail.variant) {
          this.state.variantId = event.detail.variant.id;
          this.cacheOriginalPrice();
          
          if (this.state.isEngravingSelected) {
            this.updatePrice(true);
          }
          
          this.dispatchEvent('engraving:variant-changed', { 
            variantId: this.state.variantId,
            variant: event.detail.variant,
            price: this.state.originalPrice,
            hasEngraving: this.state.isEngravingSelected
          });
        }
      });
      
      // Listen for AJAX completion events that might indicate a variant change
      document.addEventListener('ajaxComplete', () => {
        // Small delay to allow the DOM to update
        setTimeout(() => {
          this.cacheOriginalPrice();
          
          if (this.state.isEngravingSelected) {
            this.updatePrice(true);
          }
        }, 100);
      });
      
      // Initial variant setup
      this.state.variantId = this.getSelectedVariantId();
      this.cacheOriginalPrice();
      
    } catch (error) {
      console.error('Error setting up variant listener:', error);
      this.dispatchEvent('engraving:error', {
        message: 'Error setting up variant monitoring',
        error: error.message,
        type: 'variant_error'
      });
    }
  }
  
  /**
   * Handle form submission to include engraving details
   * @param {Event} e - The form submit event
   */
  async handleFormSubmit(e) {
    // Only proceed if engraving is selected and we have text
    if (!this.state.isEngravingSelected || !this.state.engravingText?.trim()) {
      return; // No engraving to add
    }
    
    // Prevent default form submission if we need to do async work
    if (this.settings.saveToCartAsync) {
      e.preventDefault();
      
      try {
        // Show loading state
        this.showLoading();
        
        // Save engraving data to the cart via API
        const success = await this.saveEngravingToCart();
        
        if (success) {
          // If successful, submit the form
          this.form.submit();
        } else {
          this.showError('Failed to save engraving details. Please try again.');
          this.hideLoading();
        }
      } catch (error) {
        console.error('Error saving engraving:', error);
        this.showError('An error occurred while saving your engraving.');
        this.hideLoading();
      }
    } else {
      // For synchronous form submission, just add the engraving as a line item property
      this.addEngravingToForm();
    }
  }
  
  /**
   * Add engraving details as hidden fields to the form
   */
  addEngravingToForm() {
    if (!this.form || !this.state.engravingText) return;
    
    try {
      // Add the engraving text as a line item property
      let engravingInput = this.form.querySelector('input[name="properties[Engraving]"]');
      
      if (!engravingInput) {
        engravingInput = document.createElement('input');
        engravingInput.type = 'hidden';
        engravingInput.name = 'properties[Engraving]';
        this.form.appendChild(engravingInput);
      }
      
      engravingInput.value = this.state.engravingText.trim();
      
      // Add engraving price if needed (as a hidden field)
      let priceInput = this.form.querySelector('input[name="properties[_engraving_price]"]');
      
      if (!priceInput) {
        priceInput = document.createElement('input');
        priceInput.type = 'hidden';
        priceInput.name = 'properties[_engraving_price]';
        this.form.appendChild(priceInput);
      }
      
      priceInput.value = this.settings.engravingPrice;
      
      // Dispatch event
      this.dispatchEvent('engraving:added-to-form', { 
        text: this.state.engravingText,
        price: this.settings.engravingPrice 
      });
      
    } catch (error) {
      console.error('Error adding engraving to form:', error);
      this.showError('Failed to add engraving to cart.');
    }
  }
  
  /**
   * Save engraving details to the cart via AJAX
   * @returns {Promise<boolean>} Whether the operation was successful
   */
  async saveEngravingToCart() {
    if (!this.state.engravingText) return false;
    
    try {
      // Get the current variant ID from the form or data attributes
      const variantId = this.getSelectedVariantId();
      if (!variantId) {
        console.error('No variant ID found');
        return false;
      }
      
      // Prepare the cart data
      const cartData = {
        items: [{
          id: variantId,
          quantity: 1,
          properties: {
            'Engraving': this.state.engravingText.trim(),
            '_engraving_price': this.settings.engravingPrice.toString()
          }
        }],
        sections: ['cart-icon-bubble', 'cart-live-region-text', 'main-cart-items']
      };
      
      // Make the API request to add to cart
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(cartData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Dispatch event
      this.dispatchEvent('engraving:added-to-cart', { 
        text: this.state.engravingText,
        price: this.settings.engravingPrice,
        cart: result
      });
      
      return true;
      
    } catch (error) {
      console.error('Error saving engraving to cart:', error);
      this.dispatchEvent('engraving:error', { 
        message: 'Failed to save engraving to cart',
        error: error.message 
      });
      return false;
    }
  }
  
  /**
   * Get the currently selected variant ID from the form
   * @returns {string|null} The selected variant ID or null if not found
   */
  getSelectedVariantId() {
    if (!this.form) return null;
    
    try {
      // Check for a variant ID in a select element
      const variantSelect = this.form.querySelector('select[name="id"]');
      if (variantSelect) {
        return variantSelect.value;
      }
      
      // Check for a variant ID in a hidden input
      const variantInput = this.form.querySelector('input[name="id"]');
      if (variantInput) {
        return variantInput.value;
      }
      
      // Check for data-variant-id on the form
      if (this.form.dataset.variantId) {
        return this.form.dataset.variantId;
      }
      
      console.warn('Could not determine variant ID');
      return null;
      
    } catch (error) {
      console.error('Error getting variant ID:', error);
      return null;
    }
  }
}

// Initialize the engraving functionality when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // You can fetch these settings from your app's API if needed
  const settings = {
    engravingPrice: 10.00,
    currency: 'USD',
    maxCharacters: 50,
    enabled: true
  };
  
  // Initialize the engraving manager
  window.engravingManager = new EngravingManager(settings);
});
