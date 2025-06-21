import { useEffect, useState } from 'react';
import { useExtensionApi, BlockStack, Text, TextField, Checkbox } from '@shopify/checkout-ui-extensions-react';

export function Extension() {
  const { extensionPoint, settings } = useExtensionApi();
  const [engravingText, setEngravingText] = useState('');
  const [isEngraving, setIsEngraving] = useState(false);
  
  // Get settings with defaults
  const engravingPrice = parseFloat(settings.engraving_price || '10.00');
  const engravingLabel = settings.engraving_label || 'Add Custom Engraving';
  const enabled = settings.engraving_enabled !== false; // Default to true if not set

  useEffect(() => {
    // This will run when the component mounts
    if (!enabled) return;
    
    // Add your custom logic here to modify the product page
    // This is a simplified example - you'll need to adjust based on your theme
    const addEngravingOption = () => {
      // Find the product form
      const form = document.querySelector('form[action*="/cart/add"]');
      if (!form) return;
      
      // Create engraving option HTML
      const engravingHTML = `
        <div class="engraving-option" style="margin: 15px 0; padding: 15px; border: 1px solid #ddd; border-radius: 4px;">
          <div class="engraving-header" style="margin-bottom: 10px; font-weight: bold;">
            ${engravingLabel} (+$${engravingPrice.toFixed(2)})
          </div>
          <div class="engraving-fields">
            <label style="display: block; margin-bottom: 8px;">
              <input type="checkbox" id="engraving-checkbox" style="margin-right: 8px;">
              I want to add engraving
            </label>
            <div id="engraving-details" style="display: none; margin-top: 10px;">
              <label for="engraving-text" style="display: block; margin-bottom: 5px;">Engraving Text (max 50 characters)</label>
              <input type="text" id="engraving-text" maxlength="50" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
              <input type="hidden" name="properties[Engraving]" id="engraving-property">
              <input type="hidden" name="properties[Engraving Price]" id="engraving-price" value="${engravingPrice.toFixed(2)}">
            </div>
          </div>
        </div>
      `;
      
      // Add to form
      form.insertAdjacentHTML('beforeend', engravingHTML);
      
      // Add event listeners
      const checkbox = document.getElementById('engraving-checkbox');
      const engravingText = document.getElementById('engraving-text');
      const engravingProperty = document.getElementById('engraving-property');
      const engravingDetails = document.getElementById('engraving-details');
      
      if (checkbox && engravingText && engravingProperty) {
        checkbox.addEventListener('change', (e) => {
          const show = e.target.checked;
          engravingDetails.style.display = show ? 'block' : 'none';
          if (!show) {
            engravingText.value = '';
            engravingProperty.value = '';
          }
          updatePrice(show);
        });
        
        engravingText.addEventListener('input', (e) => {
          engravingProperty.value = e.target.value;
        });
      }
      
      // Function to update price when engraving is selected
      const updatePrice = (isEngraving) => {
        // This is a simplified example - you'll need to adjust based on your theme
        const priceElement = document.querySelector('.product__price');
        if (!priceElement) return;
        
        // Get base price (you'll need to adjust the selector based on your theme)
        const basePrice = parseFloat(priceElement.dataset.basePrice || '0');
        const totalPrice = isEngraving ? basePrice + engravingPrice : basePrice;
        
        // Update displayed price (adjust selector as needed)
        priceElement.textContent = `$${totalPrice.toFixed(2)}`;
      };
    };
    
    // Run after a short delay to ensure DOM is loaded
    const timer = setTimeout(addEngravingOption, 1000);
    
    return () => clearTimeout(timer);
  }, [enabled, engravingPrice, engravingLabel]);

  if (!enabled) return null;

  return null; // We're using the DOM manipulation approach for better theme compatibility
}

export default Extension;
