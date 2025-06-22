// This function will be called by the theme when the variant changes
if (typeof window.updateEngravingPrice === 'undefined') {
  window.updateEngravingPrice = function() {
    const engravingOption = document.querySelector('.engraving-option');
    if (!engravingOption) return;

    const toggle = engravingOption.querySelector('[data-engraving-toggle]');
    const priceElement = engravingOption.querySelector('.engraving-price');
    
    if (!toggle || !priceElement) return;

    const basePrice = parseFloat(engravingOption.dataset.engravingPrice) || 10.00;
    
    // Format price with currency
    const formattedPrice = new Intl.NumberFormat(document.documentElement.lang || 'en-US', {
      style: 'currency',
      currency: window.Shopify.currency.active || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(basePrice);
    
    priceElement.textContent = `+${formattedPrice}`;

    // Store the price as a data attribute for cart adjustments
    engravingOption.dataset.engravingPriceValue = basePrice;
  };

  // Listen for variant changes
  document.addEventListener('change', function(event) {
    if (event.target.name === 'id' || event.target.name === 'Size') {
      window.updateEngravingPrice();
    }
  });

  // Initialize on page load
  document.addEventListener('DOMContentLoaded', window.updateEngravingPrice);
  document.addEventListener('shopify:section:load', window.updateEngravingPrice);
}

// Cart form submission handler
if (typeof window.handleEngravingFormSubmit === 'undefined') {
  window.handleEngravingFormSubmit = function(form) {
    const engravingToggle = form.querySelector('[data-engraving-toggle]');
    const engravingText = form.querySelector('[data-engraving-text]');
    const engravingOption = form.querySelector('.engraving-option');
    
    if (engravingToggle && engravingToggle.checked && engravingText && !engravingText.value.trim()) {
      alert('Please enter your engraving text or uncheck the engraving option.');
      return false;
    }
    
    // Add engraving price as a line item property
    if (engravingToggle && engravingToggle.checked && engravingOption) {
      const priceValue = parseFloat(engravingOption.dataset.engravingPriceValue || 10.00);
      
      // Create or update hidden input for engraving price
      let engravingPriceInput = form.querySelector('input[name="properties[_Engraving Price]"]');
      if (!engravingPriceInput) {
        engravingPriceInput = document.createElement('input');
        engravingPriceInput.type = 'hidden';
        engravingPriceInput.name = 'properties[_Engraving Price]';
        form.appendChild(engravingPriceInput);
      }
      engravingPriceInput.value = priceValue.toFixed(2);
    }
    
    return true;
  };

  // Override add to cart form submission
  document.addEventListener('submit', function(event) {
    const form = event.target;
    if (form.getAttribute('action') && form.getAttribute('action').includes('/cart/add')) {
      if (!window.handleEngravingFormSubmit(form)) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    }
  }, true);
  
  // Add cart hooks to adjust price when items are added
  if (typeof window.Shopify !== 'undefined' && window.Shopify.onItemAdded) {
    const originalOnItemAdded = window.Shopify.onItemAdded;
    window.Shopify.onItemAdded = function(item) {
      // Call the original handler
      if (originalOnItemAdded) {
        originalOnItemAdded(item);
      }
      
      // Check if this item has engraving
      if (item.properties && item.properties['Engraving'] === 'Yes' && 
          item.properties['_Engraving Price']) {
        // Adjust cart with engraving price
        adjustCartWithEngravingPrice(item);
      }
    };
  }
  
  // Function to adjust cart with engraving price
  function adjustCartWithEngravingPrice(item) {
    // This uses the Cart API to update the cart attributes
    // The actual price adjustment will be handled by the theme's cart-price-rules.liquid snippet
    // or by a cart calculator in the Shopify admin
    fetch('/cart/update.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        attributes: {
          ['Engraving_Item_' + item.id]: item.properties['_Engraving Price']
        }
      })
    })
    .then(response => response.json())
    .catch(error => console.error('Error updating cart:', error));
  }
}

// Initialize character counter
document.addEventListener('DOMContentLoaded', function() {
  const textareas = document.querySelectorAll('[data-engraving-text]');
  
  textareas.forEach(textarea => {
    const counter = textarea.parentElement.querySelector('.character-count .current');
    if (counter) {
      counter.textContent = textarea.value.length;
    }
  });
});
