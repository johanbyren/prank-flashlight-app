#!/bin/bash

echo "🔦 Prank Flashlight App - Setup Script"
echo "======================================"
echo ""

# Kontrollera om vi är i rätt mapp
if [ ! -f "package.json" ]; then
    echo "❌ Fel: Kör detta script från prank-flashlight-app mappen"
    exit 1
fi

# Backend setup
echo "📦 Sätter upp backend..."
cd backend

if [ ! -f ".env" ]; then
    echo "📝 Kopierar .env.example till .env..."
    cp .env.example .env
    echo ""
    echo "⚠️  VIKTIGT: Redigera backend/.env och lägg till dina Stripe-nycklar!"
    echo "   Gå till: https://dashboard.stripe.com/test/apikeys"
    echo ""
else
    echo "✅ .env finns redan"
fi

cd ..

echo ""
echo "🎯 Setup klar!"
echo ""
echo "Nästa steg:"
echo "1. Redigera backend/.env med dina Stripe-nycklar"
echo "2. Starta backend: cd backend && npm start"
echo "3. I ny terminal, starta app: npm start"
echo ""
echo "Se QUICKSTART.md för detaljerad guide!"
