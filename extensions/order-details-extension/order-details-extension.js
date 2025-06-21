// This extension adds engraving details to the order admin page
(function() {
  // Wait for the page to load
  document.addEventListener('DOMContentLoaded', function() {
    // Find the line items container
    const lineItemsContainer = document.querySelector('[data-order-details] [data-order-details-line-items]');
    
    if (!lineItemsContainer) return;

    // Get all line items
    const lineItems = lineItemsContainer.querySelectorAll('[data-line-item]');
    
    lineItems.forEach(item => {
      // Get the variant ID from the line item
      const variantId = item.getAttribute('data-variant-id');
      if (!variantId) return;
      
      // Find the engraving note in the line item properties
      const propertiesContainer = item.querySelector('[data-line-item-properties]');
      if (!propertiesContainer) return;
      
      const engravingNote = propertiesContainer.querySelector('[data-property-name^="Engraving"]');
      if (!engravingNote) return;
      
      // Get the engraving text
      const engravingText = engravingNote.querySelector('span:last-child').textContent.trim();
      if (!engravingText) return;
      
      // Create a styled engraving display
      const engravingDisplay = document.createElement('div');
      engravingDisplay.className = 'engraving-display';
      engravingDisplay.style.marginTop = '8px';
      engravingDisplay.style.padding = '8px';
      engravingDisplay.style.backgroundColor = '#f8f9fa';
      engravingDisplay.style.borderRadius = '4px';
      engravingDisplay.style.fontSize = '14px';
      
      engravingDisplay.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 4px;">Engraving Details:</div>
        <div style="font-style: italic;">${engravingText}</div>
      `;
      
      // Insert after the line item
      item.parentNode.insertBefore(engravingDisplay, item.nextSibling);
    });
  });
})();
