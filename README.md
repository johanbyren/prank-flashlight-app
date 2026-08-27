# Candela

Tänd ficklampan gratis. Släcka den? Det kostar **$99** engångs eller **$19/mån** unlimited. Stripe Payment Sheet + riktig torch via kameran.

## Stack

| Del | Teknik |
|-----|--------|
| App | Expo SDK 54 + React Native |
| Betalningar | Stripe (`@stripe/stripe-react-native`) |
| Backend | **Supabase Edge Functions** (gratis tier) |
| Distribution | **EAS Build** (APK / intern iOS) |

Lokal Express i `backend/` finns kvar som backup, men produktion går via Supabase.

## Snabbstart (utveckling)

```bash
npm install
npx expo start
```

Öppna i Expo Go (SDK 54) eller emulator. Backend behövs inte lokalt — appen pekar redan på Supabase.

### Konfiguration (`config.js`)

```js
API_URL              // https://…supabase.co/functions/v1
SUPABASE_ANON_KEY    // anon/public key (skickas som apikey + Authorization)
STRIPE_PUBLISHABLE_KEY // pk_live_… eller pk_test_…
```

Secret keys (`sk_…`) ligger **bara** som Supabase secrets — aldrig i appen.

## Supabase backend

Projekt: `prank-flashlight` (`dhciyjcbnddojxwfsrmp`, `eu-north-1`)

| Endpoint | Metod | Body |
|----------|-------|------|
| `/functions/v1/health` | GET | — |
| `/functions/v1/create-payment-intent` | POST | `{ "plan": "once" \| "subscription" }` |

### Secrets

```bash
npx supabase secrets set \
  STRIPE_SECRET_KEY=sk_live_... \
  STRIPE_PUBLISHABLE_KEY=pk_live_... \
  STRIPE_CONTEXT=acct_... \          # bara om du använder sk_org_…
  STRIPE_PRICE_SUBSCRIPTION=price_... \
  --project-ref dhciyjcbnddojxwfsrmp
```

Mer detaljer: [`supabase/README.md`](supabase/README.md).

### Redeploy functions

```bash
npx supabase functions deploy create-payment-intent --project-ref dhciyjcbnddojxwfsrmp --no-verify-jwt
npx supabase functions deploy health --project-ref dhciyjcbnddojxwfsrmp --no-verify-jwt
```

## Dela med polare (EAS)

Du behöver ett **gratis Expo-konto**: [expo.dev/signup](https://expo.dev/signup)

### 1. Logga in & koppla projektet

```bash
npx eas-cli@latest login
npx eas-cli@latest build:configure
```

`build:configure` skapar/uppdaterar `eas.json` och sätter `extra.eas.projectId` i `app.json`.

### 2. Bygg Android APK (enklast för polare)

```bash
npx eas-cli@latest build --platform android --profile preview
```

När bygget är klart: öppna länken i terminalen / på [expo.dev](https://expo.dev) → **Install** / ladda ner APK → skicka länken till kompisarna.

De måste tillåta install från okända källor (Android).

### 3. Bygg iOS (kräver Apple Developer, ~$99/år)

```bash
npx eas-cli@latest build --platform ios --profile preview
```

Intern distribution registrerar deras device UDID. Alternativt: production-build + **TestFlight**.

Utan Apple Developer-konto: iOS-polare kan använda **Expo Go** + din tunnel under tiden:

```bash
npx expo start --tunnel
```

### Profiler (`eas.json`)

| Profile | Syfte |
|---------|--------|
| `preview` | Intern delning — Android **APK**, iOS ad hoc |
| `production` | Store / TestFlight |
| `development` | Dev client (valfritt) |

## Stripe

- **Live** = riktiga pengar (nuvarande setup)
- **Test** = byt till `sk_test_` / `pk_test_` + test-`price_…` i secrets + `config.js`

Testkort (endast test mode): `4242 4242 4242 4242`, valfritt framtida datum, CVC `123`.

## Projektstruktur

```
prank-flashlight-app/
├── App.js
├── config.js                 # API_URL, anon key, Stripe pk
├── app.json                  # Expo app config
├── eas.json                  # EAS Build-profiler
├── supabase/
│   ├── functions/            # Edge Functions (Stripe)
│   ├── config.toml
│   └── README.md
└── backend/                  # Lokal Express-backup (valfritt)
```

## Felsökning

**Betalning / “Could not connect”**  
Kolla att `API_URL` + `SUPABASE_ANON_KEY` i `config.js` stämmer, och att Edge Functions är deployade.

**Organization API key / Stripe-Context**  
Om secret är `sk_org_…` måste `STRIPE_CONTEXT=acct_…` vara satt som secret.

**Ficklampan tänds inte**  
Behöver fysisk enhet + kamerabehörighet. Emulatorer saknar ofta torch.

**Expo Go funkar inte för polare**  
Använd EAS preview-APK (Android) i stället.

## Ansvarsfriskrivning

Prank mellan kompisar. I **live mode** dras riktiga pengar — var tydlig med skämtet.
