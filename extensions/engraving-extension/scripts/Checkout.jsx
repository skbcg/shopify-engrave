import React, { useState, useEffect } from 'react';
import { useExtensionApi, useApplyOrderAttributesChange, useBuyerJourney, useSettings } from '@shopify/checkout-ui-extensions-react';

// Main component for the engraving extension
export function EngravingExtension() {
  // Get extension settings
  const { engraving_price: engravingPrice = 10.00, max_characters: maxCharacters = 50, enabled = true } = useSettings();
  
  // State for the engraving option
  const [includeEngraving, setIncludeEngraving] = useState(false);
  const [engravingText, setEngravingText] = useState('');
  const [characterCount, setCharacterCount] = useState(0);
  
  // Get the API utilities
  const { applyOrderAttributesChange } = useApplyOrderAttributesChange();
  const { buyerJourney } = useBuyerJourney();
  const { extension } = useExtensionApi();

  // Handle changes to the engraving text
  const handleEngravingChange = (event) => {
    const text = event.target.value;
    if (text.length <= maxCharacters) {
      setEngravingText(text);
      setCharacterCount(text.length);
      
      // Update the order attributes with the engraving text
      if (includeEngraving) {
        updateEngravingAttribute(text);
      }
    }
  };

  // Handle toggling the engraving option
  const toggleEngraving = (checked) => {
    setIncludeEngraving(checked);
    
    if (checked) {
      // Add engraving to the order
      updateEngravingAttribute(engravingText);
    } else {
      // Remove engraving from the order
      updateEngravingAttribute('');
    }
  };

  // Update the order attributes with the engraving text
  const updateEngravingAttribute = (text) => {
    applyOrderAttributesChange({
      type: 'updateOrderAttribute',
      key: 'engraving',
      value: text || null
    });
  };

  // If the extension is disabled, don't render anything
  if (!enabled) {
    return null;
  }

  return (
    <div style={styles.container}>
      <div style={styles.optionContainer}>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={includeEngraving}
            onChange={(e) => toggleEngraving(e.target.checked)}
            style={styles.checkbox}
          />
          <span>Add Custom Engraving (+${engravingPrice.toFixed(2)})</span>
        </label>
        
        {includeEngraving && (
          <div style={styles.engravingInputContainer}>
            <label style={styles.label}>
              Engraving Text (max {maxCharacters} characters):
              <textarea
                value={engravingText}
                onChange={handleEngravingChange}
                maxLength={maxCharacters}
                style={styles.textarea}
                placeholder="Enter your custom text here"
                rows={3}
              />
            </label>
            <div style={styles.characterCount}>
              {characterCount}/{maxCharacters} characters
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Styles for the component
const styles = {
  container: {
    margin: '1rem 0',
    padding: '1rem',
    border: '1px solid #e1e1e1',
    borderRadius: '4px',
    backgroundColor: '#f9f9f9',
  },
  optionContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    fontWeight: '500',
  },
  checkbox: {
    width: '1.2rem',
    height: '1.2rem',
  },
  engravingInputContainer: {
    marginTop: '0.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    fontSize: '0.9rem',
  },
  textarea: {
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontFamily: 'inherit',
    fontSize: '0.9rem',
    resize: 'vertical',
    minHeight: '80px',
  },
  characterCount: {
    fontSize: '0.8rem',
    color: '#666',
    textAlign: 'right',
  },
};

// Export the component as the default export
export default EngravingExtension;
