require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/create-payment-intent', async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Prank Flashlight API is running!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Prank Flashlight API running on port ${PORT}`);
  console.log(`💡 Ready to accept prank payments!`);
});
