# 💰 Production Mode Guide - Riktiga Betalningar

## ⚠️ VIKTIGA VARNINGAR

### Juridiskt & Etiskt
- **Transparent**: Folk måste veta vad de betalar för
- **Consent**: Fråga om lov innan du tar pengar
- **Refunds**: Var beredd att ge tillbaka pengarna
- **Prank ettikette**: Ge tillbaka direkt efter pranket!

### Ekonomiskt
- **Stripe avgifter**: 2.9% + 1.80 kr per transaktion
- **200 kr transaktion** = Du får ~192 kr
- **Utbetalningar**: Tar 2-7 dagar till ditt bankkonto
- **Chargebacks**: Kunder kan bestrida betalningar

### Legalt
- **Skattemyndigheten**: Intäkter måste deklareras
- **Konsumentverket**: Lyder under konsumentskydd
- **Stripe ToS**: Bryt inte mot användarvillkoren

---

## 🚀 Setup Production Mode

### 1. Aktivera Stripe Live Mode

1. Gå till https://dashboard.stripe.com
2. Klicka **"Activate your account"**
3. Fyll i:
   - Företagstyp (Enskild firma / AB / Privat)
   - Företagsinformation / Personuppgifter
   - Bankkonto (IBAN för utbetalningar)
   - Verifiering (BankID, ID-kort, etc)
4. Vänta på godkännande (~10 min - 24h)

### 2. Hämta Live API Keys

1. Gå till https://dashboard.stripe.com/apikeys
2. **Växla till Live Mode** (toggle längst upp höger)
3. Kopiera nycklar:
   - `pk_live_xxxxx` (Publishable)
   - `sk_live_xxxxx` (Secret - klicka "Reveal")

### 3. Uppdatera .env.production

```bash
cd backend
```

Skapa/redigera `.env.production`:

```env
# PRODUCTION - RIKTIGA PENGAR!
STRIPE_SECRET_KEY=sk_live_51xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_51xxxxxxxxxxxxx
NODE_ENV=production
PORT=3000
```

### 4. Starta Backend i Production Mode

```bash
cd backend
NODE_ENV=production node server.js
```

Du bör se:
```
🚀 Prank Flashlight API running on port 3000
💰 LIVE MODE: Riktiga betalningar aktiverade!
⚠️  VARNING: Detta tar riktiga pengar från kunder
💡 Mode: 💰 LIVE (Real Money!)
```

---

## 💸 Återbetala Pranket (Refund)

### API Endpoint

Servern har nu ett refund endpoint:

**POST** `/refund-payment`

```bash
curl -X POST http://localhost:3000/refund-payment \
  -H "Content-Type: application/json" \
  -d '{"paymentIntentId": "pi_xxxxxxxxxxxxx"}'
```

### Hitta Payment Intent ID

1. Öppna Stripe Dashboard: https://dashboard.stripe.com/payments
2. Hitta betalningen (200 SEK, "🔦 Släck ficklampan")
3. Klicka på betalningen
4. Kopiera **Payment Intent ID** (börjar med `pi_`)

### Manuellt via Stripe Dashboard

1. Gå till https://dashboard.stripe.com/payments
2. Hitta betalningen
3. Klicka "Refund"
4. Välj "Full refund" (200 SEK)
5. Skriv anledning: "Prank - återbetalning"
6. Bekräfta

Pengarna är tillbaka på kundens kort inom 5-10 dagar.

---

## 📊 Övervaka Betalningar

### Stripe Dashboard

**Live View**: https://dashboard.stripe.com/payments

Här ser du:
- ✅ Alla betalningar i realtid
- 💰 Totala intäkter
- 📈 Statistik
- 👤 Kundinformation (om sparad)
- 🔄 Refunds

### Server Logs

Servern loggar nu alla betalningar:

```
💰 [LIVE] Payment Intent created: pi_xxx - 200 SEK - 2026-08-06T12:22:00.000Z
💸 Refund created: re_xxx for payment pi_xxx
```

---

## 🔐 Säkerhet Best Practices

### Environment Variables

**ALDRIG:**
- ❌ Commita `.env.production` till Git
- ❌ Dela secret keys med någon
- ❌ Hårdkoda keys i koden
- ❌ Logga secret keys

**ALLTID:**
- ✅ Använd .gitignore (redan gjort)
- ✅ Rotera keys regelbundet
- ✅ Använd HTTPS i production
- ✅ Validera input från klienter

### CORS i Production

Uppdatera `corsOptions` i `server.js`:

```javascript
const corsOptions = {
  origin: ['https://din-app-domain.com'],
  optionsSuccessStatus: 200
};
```

---

## 🚢 Deploy till Production Server

### Alternativ 1: Heroku

```bash
# I projekt root
heroku create prank-flashlight-api
heroku config:set STRIPE_SECRET_KEY=sk_live_xxx
heroku config:set STRIPE_PUBLISHABLE_KEY=pk_live_xxx
heroku config:set NODE_ENV=production
git push heroku main
```

### Alternativ 2: Railway

1. Gå till https://railway.app
2. New Project → Deploy from GitHub
3. Välj ditt repo
4. Lägg till Environment Variables:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PUBLISHABLE_KEY`
   - `NODE_ENV=production`

### Alternativ 3: DigitalOcean / AWS / Azure

```bash
# SSH till server
ssh user@your-server.com

# Installera Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Klona repo
git clone https://github.com/johanbyren/prank-flashlight-app.git
cd prank-flashlight-app/backend

# Installera dependencies
npm install

# Skapa .env.production
nano .env.production
# Klistra in production keys

# Kör med PM2 (process manager)
npm install -g pm2
pm2 start server.js --name prank-api --env production
pm2 save
pm2 startup
```

---

## 🧪 Testa Production Setup (Säkert)

### 1. Test Mode Först

Innan du går live, testa med test keys:

```env
STRIPE_SECRET_KEY=sk_test_xxx
```

Använd test-kort:
- **Lyckas**: 4242 4242 4242 4242
- **Misslyckas**: 4000 0000 0000 0002

### 2. Egen Test med Riktigt Kort

När du är redo för live:

1. Sätt in live keys
2. Testa med DITT EGET kort först
3. Verifiera att betalning syns i Dashboard
4. Testa refund-funktionen
5. Verifiera att refund syns på ditt kort

### 3. Prank Dina Kompisar

När allt fungerar:

✅ Sätt in live keys
✅ Deploy till produktion
✅ Testa själv först
✅ Prank kompisarna
✅ **ÅTERBETALA DIREKT** (eller enligt överenskommelse)

---

## 💡 Prank Strategier för Live Mode

### Strategi 1: "Ge Tillbaka Efter Skratt"

1. Låt dem betala 200 kr
2. Lampan släcks
3. Skratta tillsammans
4. **Refund direkt via Stripe Dashboard**
5. "Nej men shit, pengarna kommer tillbaka på 5-10 dagar!"

### Strategi 2: "Swish Tillbaka Direkt"

1. Låt dem betala 200 kr
2. Swisha tillbaka 200 kr direkt
3. Du förlorar bara Stripe-avgiften (~8 kr)
4. Värt det för skrattet? 😄

### Strategi 3: "Pre-Arranged"

1. Överenskommen i förväg
2. "Betalar du middag om jag betalar för att släcka lampan?"
3. Win-win prank

---

## 📈 Stripe Dashboard Features

### Betalningar
https://dashboard.stripe.com/payments

- Se alla transaktioner
- Filtrera på datum, belopp, status
- Exportera till CSV

### Kunder
https://dashboard.stripe.com/customers

- Spara återkommande kunder
- Se betalningshistorik
- Hantera prenumerationer (om du lägger till senare)

### Rapporter
https://dashboard.stripe.com/reports

- Dagliga/månadsvis intäkter
- Avgifter breakdown
- Skattefil för bokföring

---

## 📞 Support & Hjälp

### Stripe Support
- Dashboard: https://dashboard.stripe.com/support
- Docs: https://stripe.com/docs
- Status: https://status.stripe.com

### Om Problem Uppstår

**"Betalningen gick inte igenom":**
- Kolla Stripe Dashboard → Payments
- Se error message
- Vanliga orsaker: Kortet nekat, 3D Secure misslyckades

**"Refund tar för lång tid":**
- Normalt 5-10 arbetsdagar
- Beror på kundens bank
- Refund status i Dashboard

**"Stripe stängde mitt konto":**
- Kan hända om många disputes/chargebacks
- Kontakta Stripe support
- Förklara att det är en prank-app (kanske inte bästa idén... 😅)

---

## ⚖️ Legal Disclaimer

**Använd på egen risk!**

Detta är en prank-app. Att ta pengar från folk, även som skämt, kan ha juridiska konsekvenser om:

- Folk inte givit samtycke
- Du inte ger tillbaka pengarna
- Folk anmäler det som bedrägeri

**Rekommendation:**
- Använd bara med nära vänner
- Var transparent
- Ge tillbaka pengarna
- Ha kul, men var ansvarsfull!

---

## ✅ Production Checklist

Innan du går live:

- [ ] Stripe-konto aktiverat och verifierat
- [ ] Bankkonto kopplat för utbetalningar
- [ ] Live API keys hämtade
- [ ] `.env.production` konfigurerad
- [ ] Testat med test keys först
- [ ] Testat med eget kort i live mode
- [ ] Refund-funktionen testad
- [ ] CORS konfigurerad för production
- [ ] Backend deployad till säker server (HTTPS)
- [ ] Överenskommelse med vänner om återbetalning

---

**Lycka till med pranket!** 💰🔦😈

*P.S. Glöm inte att faktiskt ge tillbaka pengarna!* 😄
