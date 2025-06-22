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
    
    if (engravingToggle && engravingToggle.checked && engravingText && !engravingText.value.trim()) {
      alert('Please enter your engraving text or uncheck the engraving option.');
      return false;
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
