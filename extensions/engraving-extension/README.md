# Custom Engraving Extension

This Shopify Checkout UI Extension adds a custom engraving option to your product pages, allowing customers to add personalized text to their orders.

## Features

- Toggleable engraving option with configurable price
- Character limit with counter
- Real-time preview of the engraving text
- Mobile-responsive design
- Configurable settings via the Shopify admin

## Prerequisites

- Node.js 16.0.0 or higher
- npm 7.0.0 or higher
- Shopify CLI 3.0.0 or higher
- A Shopify Partner account and development store

## Installation

1. Navigate to the extension directory:
   ```bash
   cd extensions/engraving-extension
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Development

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Follow the prompts to connect to your Shopify store and deploy the extension.

## Building for Production

To build the extension for production:

```bash
npm run build
```

## Configuration

You can configure the following settings in the Shopify admin under "Apps" > "Custom Engraving" > "Extension settings":

- **Engraving Price**: The additional cost for engraving (default: $10.00)
- **Max Characters**: Maximum number of characters allowed for engraving (default: 50)
- **Enabled**: Toggle the engraving feature on/off

## How It Works

1. When a customer selects the "Add Custom Engraving" option, a text area appears for them to enter their custom text.
2. The character counter updates in real-time as they type.
3. The engraving text is saved as an order attribute when the customer proceeds to checkout.
4. The merchant can view the engraving text in the order details in the Shopify admin.

## Customization

### Styling

You can customize the appearance of the engraving component by modifying the `styles` object in `scripts/Checkout.jsx`.

### Behavior

To modify the behavior of the engraving feature, edit the `EngravingExtension` component in `scripts/Checkout.jsx`.

## Troubleshooting

### Extension not appearing in checkout

- Ensure the extension is properly installed and activated in your Shopify admin.
- Check the browser's developer console for any error messages.
- Verify that the extension is compatible with your theme.

### Changes not reflecting

- Clear your browser cache and refresh the page.
- Restart the development server with `npm run dev`.
- Ensure you've saved all your changes.

## Support

For support, please open an issue in the repository or contact the development team.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
