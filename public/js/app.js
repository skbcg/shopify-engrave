document.addEventListener('DOMContentLoaded', async function() {
  // Initialize the app
  const app = window.app = {
    config: {
      apiKey: document.querySelector('meta[name="shopify-api-key"]').content,
      shopOrigin: `https://${decodeURIComponent(
        (new RegExp('[?&]shop=([^&]+)').exec(window.location.search) || [,''])[1].replace(/'/g, "%27")
      )}`,
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
    host: new URL(app.config.shopOrigin).host,
    forceRedirect: true,
  });

  // Get the current shop's domain
  const shop = await fetch('/api/shop')
    .then(response => response.json())
    .then(data => data.shop)
    .catch(error => {
      console.error('Error fetching shop data:', error);
      return null;
    });

  if (!shop) {
    document.getElementById('app-container').innerHTML = 'Error loading shop data';
    return;
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
