# Bunnings API Access Boundary

## Status

Credential-gated. TRADESIGHT must not use Bunnings public product pages as a live data path.

## Sanctioned Path

TRADESIGHT may only use Bunnings live stock, item, pricing, and location data through approved Bunnings Partner / Developer API credentials.

## Explicit Prohibitions

- No scraping.
- No public product page fallback.
- No hidden browser fetches against product pages.
- No inferred stock claims without an authorised API response.

## Runtime Behaviour Before Approval

Until credentials and approved endpoints are configured, all Bunnings stock or pricing lookups must return:

```text
Unavailable — credential gated
```

The user-facing module may still explain what information is required:

- approved client ID
- approved client secret
- OAuth token URL
- API base URL
- Kempsey store identifier
- approved item endpoint
- approved inventory endpoint
- approved pricing endpoint
- approved location endpoint

## Environment Variables

```text
VITE_BUNNINGS_CLIENT_ID=
VITE_BUNNINGS_CLIENT_SECRET=
VITE_BUNNINGS_TOKEN_URL=
VITE_BUNNINGS_API_BASE_URL=
VITE_BUNNINGS_SCOPE=
VITE_BUNNINGS_KEMPSEY_STORE_ID=
VITE_BUNNINGS_ITEM_ENDPOINT=
VITE_BUNNINGS_INVENTORY_ENDPOINT=
VITE_BUNNINGS_PRICING_ENDPOINT=
VITE_BUNNINGS_LOCATION_ENDPOINT=
```

## TRADESIGHT Rule

Unknown stock, unknown price, and unknown availability remain unknown until validated by an authorised partner API response.
