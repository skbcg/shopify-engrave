# Shopify Engraving App Test Workflow

This document provides a step-by-step guide to test the complete workflow of the Shopify Engraving App.

## Prerequisites

- App deployed to Netlify
- App installed on Shopify store
- Theme app extension block added to theme
- Product metafields set up for engraving

## Test Workflow Steps

### 1. Theme Editor Configuration

- [ ] Go to Shopify admin > Online Store > Themes
- [ ] Click "Customize" on your current theme
- [ ] Navigate to a product page template
- [ ] Add the "Engraving Block" from the app blocks section
- [ ] Configure the block settings:
  - [ ] Set Checkbox Label to "Add Custom Engraving"
  - [ ] Set Engraving Price to 10.00
  - [ ] Set Text Field Label to "Enter Your Engraving Text"
  - [ ] Set Maximum Characters to 50
  - [ ] Configure other styling options as desired
- [ ] Save the theme changes

### 2. Product Setup

- [ ] Run the metafield setup script:
  ```bash
  node scripts/setup-metafields.js
  ```
- [ ] Follow the prompts to enable engraving on specific products
- [ ] Set custom engraving prices if needed

### 3. Product Page Testing

- [ ] Navigate to a product with engraving enabled
- [ ] Verify the engraving block appears correctly
- [ ] Check the engraving checkbox
- [ ] Verify the price display updates to include the engraving fee
- [ ] Enter text in the engraving field
- [ ] Verify character count updates correctly
- [ ] Try exceeding the maximum character limit to test validation
- [ ] Uncheck and recheck the engraving option to verify toggle behavior

### 4. Cart Testing

- [ ] Add the product to cart with engraving enabled and text entered
- [ ] View the cart
- [ ] Verify the engraving text appears in the cart item properties
- [ ] Confirm the engraving fee is added to the cart total
- [ ] Add another product with engraving to test multiple engraving items
- [ ] Remove an engraving item to verify price adjustment is removed

### 5. Checkout Testing

- [ ] Proceed to checkout
- [ ] Verify the engraving text appears in the line item properties
- [ ] Confirm the engraving fee is included in the order total
- [ ] Complete the checkout process

### 6. Order Verification

- [ ] Go to Shopify admin > Orders
- [ ] Find the test order
- [ ] Verify the engraving details appear in the order line item properties
- [ ] Confirm the engraving fee is included in the order total

## Test Results

| Test Case | Expected Result | Actual Result | Pass/Fail |
|-----------|-----------------|---------------|-----------|
| Theme Editor Configuration | Block settings saved correctly | | |
| Product Setup | Metafields created and enabled | | |
| Engraving Block Display | Block appears on product page | | |
| Price Update | Price updates when engraving is checked | | |
| Character Counter | Counter updates as text is entered | | |
| Cart Display | Engraving text and fee appear in cart | | |
| Checkout Display | Engraving details appear in checkout | | |
| Order Details | Engraving information appears in order | | |

## Troubleshooting Common Issues

### Engraving Block Not Appearing
- Verify the app is properly installed
- Check that the theme app extension is published
- Ensure the block is added to the product template

### Price Not Updating
- Check the JavaScript console for errors
- Verify the block settings are configured correctly
- Ensure the product has the engraving.enabled metafield set to true

### Engraving Text Not Appearing in Cart
- Check the form submission handling in engraving-block.js
- Verify the line item properties are being added correctly
- Inspect the cart.liquid template for property display

### Engraving Fee Not Added to Total
- Check the cart-price-rules.liquid snippet
- Verify the JavaScript price calculation
- Ensure the cart attributes are being updated correctly
