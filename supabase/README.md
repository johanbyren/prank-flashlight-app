# Supabase Backend

Stripe API runs as Edge Functions on project **prank-flashlight**
(`dhciyjcbnddojxwfsrmp`, region `eu-north-1`).

App points here via `config.js` → `API_URL` + `SUPABASE_ANON_KEY`.

## Endpoints

- `GET  /functions/v1/health`
- `POST /functions/v1/create-payment-intent` body: `{ "plan": "once" | "subscription" }`

## Secrets

Currently expected to be **live** (`sk_live_` / `sk_org_live_` + live price).

```bash
npx supabase secrets set \
  STRIPE_SECRET_KEY=sk_live_... \
  STRIPE_PUBLISHABLE_KEY=pk_live_... \
  STRIPE_PRICE_SUBSCRIPTION=price_... \
  --project-ref dhciyjcbnddojxwfsrmp
```

If using an Organization key (`sk_org_…`):

```bash
npx supabase secrets set \
  STRIPE_CONTEXT=acct_... \
  STRIPE_MODE=live \
  --project-ref dhciyjcbnddojxwfsrmp
```

For test mode, set `sk_test_` / `pk_test_` / test `price_…` the same way, and update `STRIPE_PUBLISHABLE_KEY` in `config.js`.

## Redeploy

```bash
npx supabase functions deploy create-payment-intent --project-ref dhciyjcbnddojxwfsrmp --no-verify-jwt
npx supabase functions deploy health --project-ref dhciyjcbnddojxwfsrmp --no-verify-jwt
```

Or use the Cursor Supabase MCP `deploy_edge_function` tool.

## Local Express backup

`backend/server.js` mirrors the same API for local testing. Prefer Supabase for anything you share with friends.
