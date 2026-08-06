require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// CORS Configuration
const corsOptions = {
  origin: IS_PRODUCTION 
    ? ['https://yourdomain.com'] // Uppdatera med din faktiska domain
    : '*', // Allow all i development
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Demo mode - fungerar utan Stripe nycklar för att testa UI
const DEMO_MODE = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('your_secret_key');
const IS_LIVE_MODE = process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_live_');

if (DEMO_MODE) {
  console.log('⚠️  DEMO MODE: Kör utan riktiga Stripe-nycklar');
  console.log('   För riktig Stripe-integration, lägg till nycklar i .env');
} else if (IS_LIVE_MODE) {
  console.log('💰 LIVE MODE: Riktiga betalningar aktiverade!');
  console.log('⚠️  VARNING: Detta tar riktiga pengar från kunder');
} else {
  console.log('🧪 TEST MODE: Stripe test-nycklar används');
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
      
      const timestamp = new Date().toISOString();
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 20000, // 200.00 SEK
        currency: 'sek',
        description: '🔦 Släck ficklampan',
        metadata: {
          product: 'flashlight_off',
          app: 'prank-flashlight',
          timestamp: timestamp,
          // Lägg till user ID här om du vill spåra vem som betalar
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Log för production monitoring
      if (IS_LIVE_MODE) {
        console.log(`💰 [LIVE] Payment Intent created: ${paymentIntent.id} - 200 SEK - ${timestamp}`);
      } else {
        console.log(`🧪 [TEST] Payment Intent created: ${paymentIntent.id}`);
      }

      res.json({
        clientSecret: paymentIntent.client_secret,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      });
    }
  } catch (error) {
    console.error('❌ Error creating payment intent:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  const mode = DEMO_MODE ? 'DEMO' : (IS_LIVE_MODE ? 'LIVE' : 'TEST');
  res.json({ 
    status: 'ok', 
    message: 'Prank Flashlight API is running!',
    mode: mode,
    environment: process.env.NODE_ENV || 'development',
    warning: IS_LIVE_MODE ? 'Real payments active!' : null
  });
});

// Refund endpoint - för att återbetala pranket! 😄
app.post('/refund-payment', async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    
    if (DEMO_MODE) {
      return res.json({ success: true, message: 'Demo refund successful' });
    }
    
    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment Intent ID required' });
    }

    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });

    console.log(`💸 Refund created: ${refund.id} for payment ${paymentIntentId}`);
    
    res.json({
      success: true,
      refund: refund.id,
      status: refund.status,
      amount: refund.amount / 100 + ' SEK'
    });
  } catch (error) {
    console.error('❌ Refund error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Prank Flashlight API running on port ${PORT}`);
  console.log(`💡 Mode: ${DEMO_MODE ? 'DEMO (No Stripe)' : (IS_LIVE_MODE ? '💰 LIVE (Real Money!)' : '🧪 TEST (Stripe Test)')}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  if (IS_LIVE_MODE) {
    console.log(`⚠️  LIVE MODE ACTIVE - Tar riktiga pengar!`);
  }
});
