require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Demo mode - fungerar utan Stripe nycklar för att testa UI
const DEMO_MODE = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('your_secret_key');

if (DEMO_MODE) {
  console.log('⚠️  DEMO MODE: Kör utan riktiga Stripe-nycklar');
  console.log('   För riktig Stripe-integration, lägg till nycklar i .env');
}

app.post('/create-payment-intent', async (req, res) => {
  try {
    if (DEMO_MODE) {
      // Demo mode - returnera fake data
      console.log('💡 Demo payment intent requested');
      res.json({
        clientSecret: 'demo_client_secret_' + Date.now(),
        publishableKey: 'pk_test_demo',
      });
    } else {
      // Riktig Stripe-integration
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 20000,
        currency: 'sek',
        description: '🔦 Släck ficklampan - Prank Payment',
        automatic_payment_methods: {
          enabled: true,
        },
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      });
    }
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Prank Flashlight API is running!',
    mode: DEMO_MODE ? 'DEMO' : 'PRODUCTION'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Prank Flashlight API running on port ${PORT}`);
  console.log(`💡 Mode: ${DEMO_MODE ? 'DEMO (No Stripe)' : 'PRODUCTION (Stripe Active)'}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});
