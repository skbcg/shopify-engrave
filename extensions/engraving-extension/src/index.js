import { render } from '@shopify/checkout-ui-extensions-react';
import { Extension } from './Extension';

// This will be called by Shopify when the extension is loaded
render('Checkout::Dynamic::Render', () => <Extension />);
