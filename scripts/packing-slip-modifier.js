/**
 * Modifies the packing slip PDF to include engraving details
 * This script should be used with Shopify Flow, Mechanic, or a similar app
 * that allows running custom JavaScript during order processing
 */

// This function would be called by your order processing workflow
function addEngravingToPackingSlip(pdfContent) {
  try {
    // Check if this order has engraving details
    const order = {{ order | json }};
    
    // Look for engraving in line item properties
    const engravingNotes = [];
    
    order.line_items.forEach(item => {
      if (item.properties) {
        const engravingProp = item.properties.find(prop => 
          prop.name && prop.name.toLowerCase().includes('engraving')
        );
        
        if (engravingProp && engravingProp.value) {
          engravingNotes.push({
            product: item.title,
            text: engravingProp.value
          });
        }
      }
    });
    
    if (engravingNotes.length === 0) return pdfContent;
    
    // Create HTML to inject into the PDF
    let engravingHtml = `
      <div style="margin: 15px 0; padding: 10px; background: #f8f9fa; border: 1px solid #e1e1e1; border-radius: 4px;">
        <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #333;">Engraving Details:</h3>
    `;
    
    engravingNotes.forEach(note => {
      engravingHtml += `
        <div style="margin-bottom: 8px;">
          <strong>${note.product}:</strong>
          <div style="margin-left: 15px; font-style: italic;">${note.text}</div>
        </div>
      `;
    });
    
    engravingHtml += '</div>';
    
    // Insert the engraving details after the order summary
    const orderSummaryEnd = pdfContent.indexOf('</div>', 
      pdfContent.indexOf('<div class="order-summary"')
    );
    
    if (orderSummaryEnd !== -1) {
      return (
        pdfContent.substring(0, orderSummaryEnd) +
        engravingHtml +
        pdfContent.substring(orderSummaryEnd)
      );
    }
    
    return pdfContent;
    
  } catch (error) {
    console.error('Error modifying packing slip:', error);
    return pdfContent; // Return original content if there's an error
  }
}

// Example usage in Shopify Flow or Mechanic:
// 1. Get the packing slip HTML
// 2. Pass it through this function
// 3. Generate PDF from the modified HTML
