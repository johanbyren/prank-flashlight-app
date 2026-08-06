# 📋 Nästa Steg för Din Prank App

## ✅ Vad som är klart

Din prank-app är nu komplett med:
- ✨ React Native + Expo mobilapp
- 💰 Stripe-integration för betalningar
- 🔦 Ficklampkontroll
- 😈 Prank-logik (200 kr för att släcka)

## 🚀 Hur du kör appen

### 1. Sätt upp Stripe (5 min)

```bash
cd backend
cp .env.example .env
```

Redigera `.env` och lägg till dina nycklar från https://dashboard.stripe.com/test/apikeys:

```
STRIPE_SECRET_KEY=sk_test_din_hemliga_nyckel
STRIPE_PUBLISHABLE_KEY=pk_test_din_publika_nyckel
```

### 2. Starta Backend

```bash
cd backend
npm start
```

Backend körs nu på `http://localhost:3000`

### 3. Konfigurera Frontend

**För fysisk telefon:**
- Hitta din dators IP-adress
- Uppdatera `config.js` med din IP:

```javascript
export const API_URL = 'http://DIN_IP_ADRESS:3000';
```

**För emulator:**
- iOS Simulator: `http://localhost:3000`
- Android Emulator: `http://10.0.2.2:3000`

### 4. Starta Appen

```bash
npm start
```

Sedan:
- Scanna QR-kod med Expo Go
- Eller tryck 'a' för Android / 'i' för iOS

## 📱 Installera på Telefon

### Android - Enklast!

**Med Expo Go (Snabbast för test):**
1. Installera Expo Go från Play Store
2. Scanna QR-koden när du kör `npm start`

**Bygg APK (För att dela med kompisar):**
```bash
# Installera EAS CLI
npm install -g eas-cli

# Logga in på Expo
eas login

# Bygg Android APK
eas build --platform android --profile preview

# Efter build, ladda ner och installera APK på telefonen
```

### iPhone

**Alternativ 1: Expo Go (Under utveckling)**
1. Installera Expo Go från App Store
2. Scanna QR-koden

**Alternativ 2: TestFlight (För beta-testning)**
```bash
# Kräver Apple Developer account ($99/år)
eas build --platform ios
eas submit --platform ios
```

**Alternativ 3: Direkt installation via Xcode (Gratis i 7 dagar)**
```bash
# Kräver Mac
npx expo run:ios --device
```

## 🧪 Testa Betalningen

Använd Stripe Test Mode-kort:

| Scenario | Kortnummer | Resultat |
|----------|------------|----------|
| Lyckad betalning | 4242 4242 4242 4242 | ✅ Betalning godkänd |
| Avvisad betalning | 4000 0000 0000 0002 | ❌ Kortet avvisas |
| 3D Secure | 4000 0027 6000 3184 | 🔐 Kräver autentisering |

- **Datum:** Vilket framtida datum som helst (t.ex. 12/34)
- **CVC:** Vilka 3 siffror som helst (t.ex. 123)

## 🎯 Använda Appen

1. **Öppna appen** på din telefon
2. **Ge kamera-tillstånd** när den frågar
3. **Tryck "Tänd"** - Lampan tänds gratis! ✨
4. **Tryck "Släck"** - Oj! Nu kostar det 200 kr! 😈
5. **"Betala"** - Stripe Payment Sheet dyker upp
6. **Ange test-kort** - 4242 4242 4242 4242
7. **Lampan släcks** - Efter "betalning"! 💸

## 🎬 Prank Dina Kompisar

**Bästa strategin:**
1. Låtsas att det är en vanlig ficklampsapp
2. "Visst är det smidigt att kunna tända lampan?"
3. Låt dem tända den själva
4. Vänta... vänta...
5. Se deras chockade ansikten när betalningen dyker upp! 😂

**Tips:**
- Filma reaktionen! 📹
- Ha test-kortet redo att visa
- Förklara att det är test mode efteråt

## 🛠️ Utvecklingsmöjligheter

Vill du utveckla appen vidare? Här är några idéer:

### Lägg till fler prank-funktioner:
```javascript
// Volymkontroll
import { Audio } from 'expo-av';

// Vibration
import { Vibration } from 'react-native';

// Skärm brightness
import * as Brightness from 'expo-brightness';
```

### Skärpa pranket:
- Höj priset ju längre lampan är på
- Lägg till "surge pricing" 😈
- Falska "batteriet håller på att ta slut"-varningar
- Timer som visar hur länge lampan varit på

### Dela med vänner:
- Lägg till delningsfunktion
- QR-kod för att dela appen
- Statistik över hur många som "betalat"

## 🐛 Felsökning

**Backend ansluter inte:**
- Kontrollera att `npm start` körs i backend/
- Verifiera IP-adressen i `config.js`
- Kolla att telefon och dator är på samma WiFi

**Lampan fungerar inte:**
- Ge kamera-tillstånd i telefonens inställningar
- Testa på fysisk enhet (emulatorer saknar ficklampa)

**Stripe fungerar inte:**
- Kontrollera att .env innehåller rätt nycklar
- Se till att du använder test mode-nycklar (sk_test_, pk_test_)
- Kolla backend-loggen för fel

**Appen crashar:**
```bash
# Rensa cache och starta om
npm start -- --clear
```

## 📚 Dokumentation

- **Expo:** https://docs.expo.dev
- **Stripe React Native:** https://stripe.com/docs/payments/accept-a-payment?platform=react-native
- **Expo Camera:** https://docs.expo.dev/versions/latest/sdk/camera/

## 🎉 Ha Roligt!

Kom ihåg:
- Detta är en **prank-app** för skoj mellan kompisar
- Använd **test mode** i Stripe (inga riktiga pengar)
- Var tydlig med att det är ett skämt efteråt
- Filma reaktionerna! 😂

---

**Frågor?** Kolla [README.md](README.md) för mer information!

**Buggrapport?** Öppna ett issue på GitHub (när du pushat projektet)

**Lycka till med pranket!** 🔦💡😈
