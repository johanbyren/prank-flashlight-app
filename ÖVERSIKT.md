# 🎯 Projektöversikt - Prank Ficklampa

## 📁 Projektstruktur

```
prank-flashlight-app/
│
├── 📱 MOBILAPP (React Native + Expo)
│   ├── App.js                    # Huvudapp med UI & prank-logik
│   ├── config.js                 # API URL-konfiguration
│   ├── app.json                  # Expo & permissions config
│   ├── package.json              # Dependencies & scripts
│   └── assets/                   # Ikoner och bilder
│
├── 🖥️  BACKEND (Node.js + Express + Stripe)
│   ├── server.js                 # API server för Stripe
│   ├── .env.example              # Template för miljövariabler
│   └── package.json              # Backend dependencies
│
└── 📚 DOKUMENTATION
    ├── README.md                 # Fullständig guide
    ├── QUICKSTART.md            # 5-minuters snabbstart
    ├── NEXT_STEPS.md            # Nästa steg & tips
    └── setup.sh                 # Setup-script
```

## 🔧 Teknisk Stack

### Frontend
- **React Native** - Cross-platform mobilapp
- **Expo** - Development platform
- **@stripe/stripe-react-native** - Stripe SDK för React Native
- **expo-camera** - För ficklampkontroll (torch)

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **Stripe API** - Betalningshantering
- **CORS** - Cross-Origin Resource Sharing

## 💡 Hur Appen Fungerar

### 1. Tända Ficklampa (Gratis)
```
User trycker "Tänd" 
→ App begär kamera-tillstånd
→ Expo Camera API aktiverar torch
→ Lampan tänds ✨
```

### 2. Försök Släcka (200 kr!)
```
User trycker "Släck"
→ Alert visas: "Betala 200 kr för att släcka"
→ User trycker "Betala"
→ Frontend anropar Backend API
```

### 3. Stripe Betalning
```
Backend skapar Payment Intent (200 SEK)
→ Returnerar clientSecret till Frontend
→ Stripe Payment Sheet visas
→ User anger kortnummer (test: 4242...)
→ Stripe processar betalning
```

### 4. Släck Lampan
```
Betalning lyckad
→ Alert: "Tack för dina pengar!"
→ Camera torch stängs av
→ Lampan släcks 🌙
```

## 🔐 Säkerhet & API-nycklar

### Stripe Test Mode
- **Publishable Key (pk_test_...)**: Används i frontend, kan delas
- **Secret Key (sk_test_...)**: Används i backend, HÅLL HEMLIG

### Miljövariabler
Backend använder `.env` för känsliga nycklar:
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

⚠️ **`.env` är i .gitignore** - pushas aldrig till Git!

## 📱 Installationsmetoder

### För Utveckling
1. **Expo Go** - Scanna QR, instant testing
2. **iOS Simulator** - Kräver Mac + Xcode
3. **Android Emulator** - Android Studio

### För Distribution
1. **Android APK** - Via EAS Build, installera direkt
2. **iOS TestFlight** - Beta-testning, kräver Apple Dev ($99/år)
3. **iOS Direct** - Via Xcode, 7 dagar gratis

## 🧪 Test Mode Payment Cards

| Kortnummer | Scenario |
|------------|----------|
| 4242 4242 4242 4242 | ✅ Lyckad betalning |
| 4000 0000 0000 0002 | ❌ Kort avvisas |
| 4000 0027 6000 3184 | 🔐 Kräver 3D Secure |

## 🚀 Kom Igång på 5 Minuter

```bash
# 1. Backend setup
cd backend
cp .env.example .env
# → Redigera .env med Stripe-nycklar

# 2. Starta backend
npm start

# 3. Konfigurera frontend
# → Redigera config.js med din IP

# 4. Starta app
cd ..
npm start

# 5. Scanna QR med Expo Go!
```

## 🎭 Prank Tips

### Bästa Strategin
1. Visa appen casually: "Kolla, en ficklampsapp"
2. Låt dem tända själva
3. Vänta tills de vill släcka
4. 💥 PRANK! 200 kr please!

### Variationer
- Säg "den är gratis att ladda ner!"
- "Superpraktisk ficklampsapp"
- Låtsas bli lika chockad: "Vad?! 200 kr?!"

## 🔮 Framtida Features

### Fler Prank-funktioner
- 🔊 Volymkontroll (höj = gratis, sänk = 200 kr)
- 📳 Vibration (kan inte stängas av)
- 💡 Skärm brightness (max = gratis, dimma = betala)
- ⏰ Timer - priset ökar över tid!

### Gamification
- Statistik över "betalningar"
- Leaderboard bland kompisar
- Achievement system
- Delningsfunktion

### Professionalitet
- Fake loading screens
- "Processing payment..." animationer
- Fejkad kvittomail
- Customer support-sida (som också kostar)

## 📊 API Endpoints

### `POST /create-payment-intent`
Skapar Stripe Payment Intent

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "publishableKey": "pk_test_xxx"
}
```

### `GET /health`
Health check

**Response:**
```json
{
  "status": "ok",
  "message": "Prank Flashlight API is running!"
}
```

## 🐛 Vanliga Problem & Lösningar

| Problem | Lösning |
|---------|---------|
| "Kunde inte ansluta" | Kontrollera API_URL i config.js |
| Lampan tänds inte | Ge kamera-tillstånd i Settings |
| Stripe fungerar inte | Verifiera .env innehåller rätt nycklar |
| QR-kod funkar inte | Se till backend körs först |

## 📖 Dokumentationsöversikt

- **[README.md](README.md)** - Komplett guide med allt
- **[QUICKSTART.md](QUICKSTART.md)** - 5-minuters snabbstart
- **[NEXT_STEPS.md](NEXT_STEPS.md)** - Nästa steg efter setup
- **[ÖVERSIKT.md](ÖVERSIKT.md)** - Detta dokument

## 🎉 Ha Kul!

Detta är en **prank-app** gjord för skoj mellan kompisar!

- Använd **test mode** (inga riktiga pengar)
- Filma reaktionerna! 📹
- Var tydlig efteråt att det var ett skämt
- Dela gärna med andra utvecklare!

---

**Gjord med 💡 och lite bus**

**Tekniker:** React Native, Expo, Stripe, Node.js, Express
**Utvecklad:** August 2026
**Syfte:** Prank & Ha roligt med vänner 😈
