// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
  // Get shop and host from URL
  const urlParams = new URLSearchParams(window.location.search);
  const shop = urlParams.get('shop');
  const host = urlParams.get('host');
  
  if (!shop) {
    document.getElementById('app-container').innerHTML = `
      <div class="Polaris-Banner Polaris-Banner--statusCritical">
        <div class="Polaris-Banner__Content">
          <div class="Polaris-Banner__Heading">
            <p>Error: Missing shop parameter. Please access this app from the Shopify Admin.</p>
          </div>
        </div>
      </div>`;
    return;
  }

  // Initialize the app
  const app = window.app = {
    config: {
      apiKey: process.env.SHOPIFY_API_KEY, // Will be replaced by Netlify
      shopOrigin: `https://${shop}`,
      host: host,
      debug: false,
    },
    state: {},
  };

  // Initialize Shopify App Bridge
  const AppBridge = window['app-bridge'];
  const actions = AppBridge.actions;
  const createApp = AppBridge.default;
  
  window.appBridge = createApp({
    apiKey: app.config.apiKey,
    host: app.config.host,
    forceRedirect: true,
  });
  
  // Set up the UI
  renderApp();

  // Add event listeners after the DOM is fully loaded
  document.addEventListener('click', function(e) {
    if (e.target && e.target.matches('.save-settings')) {
      saveSettings();
    }
  });
});

// Save settings to Shopify
async function saveSettings() {
  const enabled = document.getElementById('engraving-enabled').checked;
  console.log('Saving settings:', { enabled });
  
  // Here you would typically make an API call to save the settings
  // For now, we'll just show a success message
  const notification = document.createElement('div');
  notification.className = 'Polaris-Banner Polaris-Banner--statusSuccess';
  notification.innerHTML = `
    <div class="Polaris-Banner__Content">
      <div class="Polaris-Banner__Heading">
        <p>Settings saved successfully!</p>
      </div>
    </div>`;
  
  const container = document.getElementById('app-container');
  container.insertBefore(notification, container.firstChild);
  
  // Remove the notification after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Render the main app UI
function renderApp() {
  const appContainer = document.getElementById('app-container');
  if (!appContainer) return;
  
  appContainer.innerHTML = `
    <div class="Polaris-Card">
      <div class="Polaris-Card__Section">
        <h2 class="Polaris-Heading">Custom Engraving Settings</h2>
        <div class="Polaris-FormLayout">
          <div class="Polaris-FormLayout__Item">
            <div class="Polaris-Labelled__LabelWrapper">
              <div class="Polaris-Label">
                <label class="Polaris-Label__Text" for="engraving-enabled">Enable Engraving</label>
              </div>
            </div>
            <div class="Polaris-Choice">
              <label class="Polaris-Choice__Label" for="engraving-enabled">
                <div class="Polaris-Choice__Control">
                  <div class="Polaris-Checkbox">
                    <input id="engraving-enabled" type="checkbox" class="Polaris-Checkbox__Input">
                    <div class="Polaris-Checkbox__Backdrop"></div>
                    <div class="Polaris-Checkbox__Icon">
                      <span class="Polaris-Icon">
                        <svg viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true">
                          <path d="M8.315 13.86l-3.182-3.417a.5.5 0 0 1-.114-.168.5.5 0 0 1 .8-.6l2.69 2.817 6.486-8.162a.5.5 0 0 1 .8.6l-7 8.816a.5.5 0 0 1-.8 0z"></path>
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
                <span class="Polaris-Choice__Label">Enable custom engraving for products</span>
              </label>
            </div>
          </div>
          <div class="Polaris-FormLayout__Item">
            <div class="Polaris-ButtonGroup">
              <button type="button" class="Polaris-Button Polaris-Button--primary save-settings">
                <span class="Polaris-Button__Content">
                  <span class="Polaris-Button__Text">Save Settings</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>`;
    
    // Add event listeners
    document.getElementById('engraving-enabled').addEventListener('change', function(e) {
      // Save setting to localStorage or make API call
      console.log('Engraving enabled:', e.target.checked);
    });
}

  // Render the app UI
  renderApp();

  function renderApp() {
    const appContainer = document.getElementById('app-container');
    appContainer.innerHTML = `
      <div class="Polaris-FormLayout">
        <div class="Polaris-FormLayout__Item">
          <div class="Polaris-Card">
            <div class="Polaris-Card__Section">
              <h2 class="Polaris-Heading">Custom Engraving Settings</h2>
              <p>Enable custom engraving for products and set up engraving options.</p>
              <div class="Polaris-FormLayout">
                <div class="Polaris-FormLayout__Item">
                  <div class="Polaris-FormLayout__Group">
                    <div class="Polaris-FormLayout__Items">
                      <div class="Polaris-FormLayout__Item">
                        <div class="Polaris-FormLayout__Group">
                          <div class="Polaris-FormLayout__Items">
                            <div class="Polaris-FormLayout__Item">
                              <div class="Polaris-FormLayout__Group">
                                <div class="Polaris-FormLayout__Items">
                                  <div class="Polaris-FormLayout__Item">
                                    <div class="Polaris-FormLayout__Group">
                                      <div class="Polaris-FormLayout__Items">
                                        <div class="Polaris-FormLayout__Item">
                                          <div class="Polaris-FormLayout__Group">
                                            <div class="Polaris-FormLayout__Items">
                                              <div class="Polaris-FormLayout__Item">
                                                <div class="Polaris-FormLayout__Group">
                                                  <div class="Polaris-FormLayout__Items">
                                                    <div class="Polaris-FormLayout__Item">
                                                      <div class="Polaris-FormLayout__Group">
                                                        <div class="Polaris-FormLayout__Items">
                                                          <div class="Polaris-FormLayout__Item">
                                                            <div class="Polaris-Checkbox">
                                                              <input type="checkbox" id="enable-engraving" class="Polaris-Checkbox__Input">
                                                              <div class="Polaris-Checkbox__Backdrop"></div>
                                                              <div class="Polaris-Checkbox__Icon">
                                                                <span class="Polaris-Icon">
                                                                  <svg viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true">
                                                                    <path d="M8.315 13.859l-3.182-3.417a.506.506 0 0 1 0-.684l.643-.683a.437.437 0 0 1 .642 0l2.22 2.393 4.942-5.327a.437.437 0 0 1 .643 0l.643.684a.504.504 0 0 1 0 .683l-5.91 6.35a1.013 1.013 0 0 1-1.43 0z"></path>
                                                                  </svg>
                                                                </span>
                                                              </div>
                                                            </div>
                                                            <label for="enable-engraving" class="Polaris-Checkbox__Label">
                                                              <span class="Polaris-Text--root Polaris-Text--bodyMd">Enable Custom Engraving</span>
                                                            </label>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
});
