import React, { useState, useEffect } from 'react';
import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Button,
  Banner,
  Spinner,
  Frame,
  Loading,
  Toast,
  Select,
  DataTable,
  Badge,
  TextStyle,
  ResourceList,
  ResourceItem,
  Checkbox,
  Stack,
  TextContainer,
  Heading,
  Tabs
} from '@shopify/polaris';
import { TitleBar, useAppBridge } from '@shopify/app-bridge-react';
import { getSessionToken } from '@shopify/app-bridge-utils';

const App = () => {
  const app = useAppBridge();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [toast, setToast] = useState({ active: false, message: '', error: false });
  
  // Global settings
  const [settings, setSettings] = useState({
    defaultPrice: 10.00,
    defaultCheckboxLabel: 'Add Custom Engraving',
    defaultTextLabel: 'Engraving Text',
    defaultPlaceholder: 'Enter your engraving text here (max 100 characters)',
    maxCharacters: 100
  });

  // Products state
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getSessionToken(app);
        
        // Fetch settings
        const settingsResponse = await fetch('/api/settings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (settingsResponse.ok) {
          const data = await settingsResponse.json();
          if (data.settings) {
            setSettings(prev => ({
              ...prev,
              ...data.settings
            }));
          }
        }


        // Fetch products with engraving status
        const productsResponse = await fetch('/api/products', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (productsResponse.ok) {
          const { products: productList } = await productsResponse.json();
          setProducts(productList);
          
          // Find products with engraving enabled
          const enabledProducts = productList
            .filter(p => p.engravingEnabled)
            .map(p => p.id);
          setSelectedProducts(enabledProducts);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        showToast('Error loading data. Please try again.', true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const token = await getSessionToken(app);
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        showToast('Settings saved successfully!');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast('Error saving settings. Please try again.', true);
    } finally {
      setSaving(false);
    }
  };

  const handleProductToggle = async (productId, enabled) => {
    try {
      const token = await getSessionToken(app);
      const response = await fetch(`/api/products/${productId}/engraving`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ enabled })
      });

      if (response.ok) {
        setSelectedProducts(prev => 
          enabled 
            ? [...prev, productId]
            : prev.filter(id => id !== productId)
        );
        showToast(`Engraving ${enabled ? 'enabled' : 'disabled'} for product`);
      } else {
        throw new Error('Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      showToast('Error updating product. Please try again.', true);
    }
  };

  const showToast = (message, isError = false) => {
    setToast({ active: true, message, error: isError });
    setTimeout(() => setToast({ ...toast, active: false }), 3000);
  };

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.id.toString().includes(searchQuery)
  );

  const resourceName = {
    singular: 'product',
    plural: 'products',
  };

  const renderProducts = () => (
    <Card sectioned>
      <ResourceList
        resourceName={resourceName}
        items={filteredProducts}
        renderItem={(product) => {
          const { id, title, image, status, engravingEnabled } = product;
          const isSelected = selectedProducts.includes(id);
          
          return (
            <ResourceItem
              id={id}
              onClick={() => handleProductToggle(id, !isSelected)}
              accessibilityLabel={`Select ${title}`}
            >
              <Stack alignment="center">
                <Stack.Item>
                  <Checkbox
                    label=""
                    checked={isSelected}
                    onChange={(checked) => handleProductToggle(id, checked)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Stack.Item>
                <Stack.Item fill>
                  <TextStyle variation="strong">{title}</TextStyle>
                </Stack.Item>
                <Stack.Item>
                  <Badge status={status === 'ACTIVE' ? 'success' : 'attention'}>
                    {status}
                  </Badge>
                </Stack.Item>
              </Stack>
            </ResourceItem>
          );
        }}
        filterControl={
          <TextField
            label="Search products"
            labelHidden
            type="search"
            placeholder="Search products"
            value={searchQuery}
            onChange={setSearchQuery}
            autoComplete="off"
          />
        }
      />
    </Card>
  );

  const renderSettings = () => (
    <Card sectioned>
      <FormLayout>
        <TextField
          label="Default Engraving Price"
          type="number"
          value={settings.defaultPrice}
          onChange={(value) => setSettings({...settings, defaultPrice: parseFloat(value)})}
          prefix="$"
          min="0"
          step="0.01"
        />
        <TextField
          label="Checkbox Label"
          value={settings.defaultCheckboxLabel}
          onChange={(value) => setSettings({...settings, defaultCheckboxLabel: value})}
          helpText="Text shown next to the engraving checkbox"
        />
        <TextField
          label="Text Input Label"
          value={settings.defaultTextLabel}
          onChange={(value) => setSettings({...settings, defaultTextLabel: value})}
        />
        <TextField
          label="Placeholder Text"
          value={settings.defaultPlaceholder}
          onChange={(value) => setSettings({...settings, defaultPlaceholder: value})}
          multiline={3}
        />
        <TextField
          label="Maximum Characters"
          type="number"
          value={settings.maxCharacters}
          onChange={(value) => setSettings({...settings, maxCharacters: parseInt(value, 10)})}
          min="1"
          max="500"
        />
        <Button primary onClick={handleSaveSettings} loading={saving}>
          Save Settings
        </Button>
      </FormLayout>
    </Card>
  );

  const tabs = [
    {
      id: 'products',
      content: 'Products',
      panelID: 'products-panel',
      component: renderProducts()
    },
    {
      id: 'settings',
      content: 'Settings',
      panelID: 'settings-panel',
      component: renderSettings()
    }
  ];

  if (loading) {
    return (
      <Frame>
        <Loading />
      </Frame>
    );
  }

  return (
    <Page
      title="Engraving App"
      subtitle="Manage engraving options for your products"
    >
      <TitleBar title="Engraving App" />
      
      <Tabs tabs={tabs} selected={activeTab} onSelect={setActiveTab}>
        {tabs[activeTab].component}
      </Tabs>

      {toast.active && (
        <Toast
          content={toast.message}
          error={toast.error}
          onDismiss={() => setToast({ ...toast, active: false })}
        />
      )}
    </Page>
  );
};

export default App;
