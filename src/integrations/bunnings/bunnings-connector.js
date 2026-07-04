const REQUIRED_CONFIG_KEYS = [
  'clientId',
  'clientSecret',
  'tokenUrl',
  'apiBaseUrl'
];

export const BUNNINGS_ACCESS_RULE = {
  provider: 'bunnings',
  accessPath: 'approved-partner-api',
  publicPagesAllowed: false,
  scrapingAllowed: false,
  liveAccessWithoutCredentials: false,
  defaultStore: 'Kempsey',
  statusWhenUnconfigured: 'Unavailable — credential gated'
};

export function createBunningsConfig(env = import.meta.env || {}) {
  return {
    clientId: env.VITE_BUNNINGS_CLIENT_ID || '',
    clientSecret: env.VITE_BUNNINGS_CLIENT_SECRET || '',
    tokenUrl: env.VITE_BUNNINGS_TOKEN_URL || '',
    apiBaseUrl: env.VITE_BUNNINGS_API_BASE_URL || '',
    scope: env.VITE_BUNNINGS_SCOPE || '',
    storeId: env.VITE_BUNNINGS_KEMPSEY_STORE_ID || '',
    itemEndpoint: env.VITE_BUNNINGS_ITEM_ENDPOINT || '',
    inventoryEndpoint: env.VITE_BUNNINGS_INVENTORY_ENDPOINT || '',
    pricingEndpoint: env.VITE_BUNNINGS_PRICING_ENDPOINT || '',
    locationEndpoint: env.VITE_BUNNINGS_LOCATION_ENDPOINT || ''
  };
}

export function validateBunningsConfig(config = createBunningsConfig()) {
  const missing = REQUIRED_CONFIG_KEYS.filter((key) => !config[key]);

  return {
    provider: BUNNINGS_ACCESS_RULE.provider,
    configured: missing.length === 0,
    missing,
    rule: BUNNINGS_ACCESS_RULE,
    status: missing.length === 0 ? 'Configured — pending authorised API response' : BUNNINGS_ACCESS_RULE.statusWhenUnconfigured
  };
}

export function createCredentialGatedResult(operation, config = createBunningsConfig()) {
  const validation = validateBunningsConfig(config);

  return {
    provider: BUNNINGS_ACCESS_RULE.provider,
    operation,
    ok: false,
    status: validation.status,
    credentialGated: true,
    publicPagesUsed: false,
    scrapingUsed: false,
    missingConfig: validation.missing,
    store: config.storeId || BUNNINGS_ACCESS_RULE.defaultStore
  };
}

async function requestAccessToken({ config, fetchImpl }) {
  const validation = validateBunningsConfig(config);
  if (!validation.configured) {
    return createCredentialGatedResult('oauth-token', config);
  }

  const body = new URLSearchParams({ grant_type: 'client_credentials' });
  if (config.scope) body.set('scope', config.scope);

  const response = await fetchImpl(config.tokenUrl, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${config.clientId}:${config.clientSecret}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  });

  if (!response.ok) {
    return {
      provider: BUNNINGS_ACCESS_RULE.provider,
      operation: 'oauth-token',
      ok: false,
      status: `OAuth token request failed with HTTP ${response.status}`,
      credentialGated: true,
      publicPagesUsed: false,
      scrapingUsed: false
    };
  }

  return response.json();
}

function buildApiUrl(config, endpoint, params = {}) {
  const base = config.apiBaseUrl.replace(/\/$/, '');
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = new URL(`${base}${path}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}

async function callPartnerApi({ operation, endpoint, params, config, fetchImpl }) {
  const validation = validateBunningsConfig(config);
  if (!validation.configured || !endpoint) {
    return createCredentialGatedResult(operation, config);
  }

  const token = await requestAccessToken({ config, fetchImpl });
  if (!token?.access_token) {
    return {
      ...createCredentialGatedResult(operation, config),
      status: token.status || 'OAuth token unavailable'
    };
  }

  const response = await fetchImpl(buildApiUrl(config, endpoint, params), {
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    return {
      provider: BUNNINGS_ACCESS_RULE.provider,
      operation,
      ok: false,
      status: `Partner API request failed with HTTP ${response.status}`,
      credentialGated: true,
      publicPagesUsed: false,
      scrapingUsed: false
    };
  }

  return {
    provider: BUNNINGS_ACCESS_RULE.provider,
    operation,
    ok: true,
    credentialGated: false,
    publicPagesUsed: false,
    scrapingUsed: false,
    data: await response.json()
  };
}

export function createBunningsClient({ config = createBunningsConfig(), fetchImpl = fetch } = {}) {
  return {
    accessRule: BUNNINGS_ACCESS_RULE,
    validate: () => validateBunningsConfig(config),
    queryItem: (params = {}) => callPartnerApi({
      operation: 'query-item',
      endpoint: config.itemEndpoint,
      params,
      config,
      fetchImpl
    }),
    queryInventory: (params = {}) => callPartnerApi({
      operation: 'query-inventory',
      endpoint: config.inventoryEndpoint,
      params: { storeId: config.storeId, ...params },
      config,
      fetchImpl
    }),
    queryPricing: (params = {}) => callPartnerApi({
      operation: 'query-pricing',
      endpoint: config.pricingEndpoint,
      params: { storeId: config.storeId, ...params },
      config,
      fetchImpl
    }),
    queryLocation: (params = {}) => callPartnerApi({
      operation: 'query-location',
      endpoint: config.locationEndpoint,
      params,
      config,
      fetchImpl
    })
  };
}
