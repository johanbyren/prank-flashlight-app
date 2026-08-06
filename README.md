# 🔦 Prank Ficklampa App

En rolig prank-app för dina kompisar! Tänd ficklampan gratis, men släcka den? Det kostar 200 kr! 😈

## 🎭 Hur den fungerar

1. **Tänd lampan** - Helt gratis! Bara tryck på knappen
2. **Försök släcka** - Oj oj, nu vill appen ha 200 kr! 💸
3. **Betala (eller inte)** - Med riktig Stripe-integration
4. **Lampan släcks** - Men först efter betalning! 😂

## 🚀 Installation & Setup

### 1. Backend (Stripe API Server)

```bash
cd backend

# Kopiera och konfigurera .env
cp .env.example .env

# Lägg till dina Stripe-nycklar i .env:
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_PUBLISHABLE_KEY=pk_test_...

# Starta servern
npm start
```

Servern körs på `http://localhost:3000`

**Viktigt:** För att testa på fysisk enhet, uppdatera `config.js` med din dators lokala IP-adress:
- Hitta din IP: `ipconfig` (Windows) eller `ifconfig` (Mac/Linux)
- Exempel: `http://192.168.1.100:3000`

### 2. Mobile App

```bash
# I root-mappen (prank-flashlight-app/)
npm start

# Välj sedan:
# - 'a' för Android
# - 'i' för iOS
```

### 3. Konfigurera API URL

Uppdatera `config.js` beroende på var du kör:

```javascript
// För iOS Simulator
export const API_URL = 'http://localhost:3000';

// För Android Emulator
export const API_URL = 'http://10.0.2.2:3000';

// För fysisk enhet (ersätt med din dators IP)
export const API_URL = 'http://192.168.1.100:3000';
```

## 📱 Testa på din telefon

### För Android (Enklast!)

1. **Bygg APK:**
```bash
npx eas build --platform android --profile preview
```

2. **Installera APK på telefonen**
   - Ladda ner APK-filen till telefonen
   - Öppna filen och installera (aktivera "Installera från okända källor")

### För iPhone

**Alternativ 1: Expo Go (Under utveckling)**
```bash
npm start
# Scanna QR-koden med Expo Go-appen
```

**Alternativ 2: TestFlight (Kräver Apple Developer)**
```bash
npx eas build --platform ios
```

**Alternativ 3: Direkt från Xcode (7 dagar gratis)**
```bash
npx expo run:ios
# Anslut iPhone via USB och installera direkt
```

## 🔑 Hämta Stripe API-nycklar

1. Gå till [Stripe Dashboard](https://dashboard.stripe.com)
2. Logga in eller skapa konto
3. Gå till **Developers → API keys**
4. Kopiera:
   - **Publishable key** (`pk_test_...`)
   - **Secret key** (`sk_test_...`)
5. Klistra in i `backend/.env`

**Tips:** Använd **Test Mode** så att inga riktiga betalningar görs!

## 🧪 Testa Betalningen

I Stripe Test Mode kan du använda dessa testkort:

- **Lyckas:** `4242 4242 4242 4242`
- **Misslyckas:** `4000 0000 0000 0002`
- **Datum:** Vilket som helst framtida datum
- **CVC:** Vilka 3 siffror som helst
- **Postnummer:** Vilket som helst

## 🛠️ Teknisk Stack

- **Frontend:** React Native + Expo
- **Backend:** Node.js + Express
- **Betalningar:** Stripe Payment Intents API
- **Ficklampa:** Expo Camera (Torch)

## 📂 Projektstruktur

```
prank-flashlight-app/
├── App.js                 # Huvudapp med UI & logik
├── config.js              # API URL konfiguration
├── app.json              # Expo konfiguration
├── backend/
│   ├── server.js         # Express API server
│   ├── .env.example      # Miljövariabler template
│   └── package.json
└── README.md
```

## 🎮 Användning

1. **Starta backend:** `cd backend && npm start`
2. **Starta app:** `npm start` (i root)
3. **Öppna på telefon** via Expo Go eller fysisk build
4. **Tänd lampan** - Gratis! ✨
5. **Försök släcka** - 200 kr tack! 💸
6. **Pranket är igång!** 😈

## ⚠️ Ansvarsfriskrivning

Detta är en **prank-app för skoj skull** mellan kompisar! 

- Använd endast med vänner som förstår skämtet
- I test mode tar Stripe inga riktiga pengar
- Om du aktiverar production mode - var tydlig med att det är en prank!

## 🐛 Felsökning

**"Kunde inte ansluta till servern"**
- Kontrollera att backend körs (`npm start` i backend/)
- Verifiera att API_URL i `config.js` är korrekt
- Om fysisk enhet: använd datorns lokala IP, inte localhost

**"Ingen tillgång till kamera"**
- Ge appen kamera-tillstånd i telefonens inställningar
- På iOS: Inställningar → Prank Ficklampa → Kamera
- På Android: Inställningar → Appar → Prank Ficklampa → Behörigheter

**Lampan tänds inte**
- Vissa emulatorer stödjer inte ficklampa
- Testa på fysisk enhet istället

## 🎉 Ha kul!

Glöm inte att filma dina kompisars reaktioner! 😂📱

---

**Made with 💡 and a bit of mischief**
