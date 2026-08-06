# 🚀 Snabbstart - 5 minuter till prank!

## Steg 1: Backend Setup (2 min)

```bash
cd backend
cp .env.example .env
```

**Redigera `backend/.env` och lägg till dina Stripe-nycklar:**
- Gå till: https://dashboard.stripe.com/test/apikeys
- Kopiera dina test-nycklar
- Klistra in i `.env`

```bash
npm start
```

✅ Servern körs nu på http://localhost:3000

## Steg 2: Hitta din IP (för fysisk telefon)

**Mac/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```bash
ipconfig
```

Hitta din lokala IP (t.ex. `192.168.1.100`)

## Steg 3: Uppdatera API URL

Redigera `config.js` i root-mappen:

```javascript
// Ersätt med din IP
export const API_URL = 'http://192.168.1.100:3000';
```

## Steg 4: Starta appen

```bash
cd ..  # Tillbaka till root
npm start
```

Scanna QR-koden med Expo Go-appen!

## 🎯 Test Mode Kort

När du ska "betala":
- **Kortnummer:** 4242 4242 4242 4242
- **Datum:** 12/34
- **CVC:** 123

## 🎉 Klart!

1. Tänd lampan (gratis)
2. Försök släcka (200 kr!) 😈
3. Skratta åt dina kompisar! 😂

---

**Problem?** Kolla [README.md](README.md) för felsökning.
