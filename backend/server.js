require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');

const app = express();
const PORT = process.env.PORT || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const secretKey = process.env.STRIPE_SECRET_KEY || '';
const stripeContext = process.env.STRIPE_CONTEXT || process.env.STRIPE_ACCOUNT_ID || '';
const DEMO_MODE =
  !secretKey ||
  secretKey.includes('your_secret_key') ||
  secretKey.includes('placeholder');
const IS_ORG_KEY = secretKey.startsWith('sk_org_');
const IS_LIVE_MODE =
  secretKey.startsWith('sk_live_') ||
  secretKey.startsWith('sk_org_live_') ||
  (IS_ORG_KEY && process.env.STRIPE_MODE === 'live');

const corsOptions = {
  origin: IS_PRODUCTION ? ['https://yourdomain.com'] : '*',
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

function getStripe() {
  if (IS_ORG_KEY && !stripeContext) {
    throw new Error(
      'Organization API keys require STRIPE_CONTEXT (acct_...). Find it in Stripe Dashboard → Settings → Account details.'
    );
  }

  const options = {};
  if (stripeContext) {
    options.stripeContext = stripeContext;
  }

  return new Stripe(secretKey, options);
}

if (DEMO_MODE) {
  console.log('⚠️  DEMO MODE: No valid Stripe secret key');
} else if (IS_ORG_KEY) {
  console.log('🏢 Organization API key detected');
  if (stripeContext) {
    console.log(`   Stripe-Context: ${stripeContext}`);
  } else {
    console.log('   ⚠️  Missing STRIPE_CONTEXT=acct_... in .env');
  }
} else if (IS_LIVE_MODE) {
  console.log('💰 LIVE MODE: Real payments enabled');
} else {
  console.log('🧪 TEST MODE: Stripe test keys');
}

app.post('/create-payment-intent', async (req, res) => {
  try {
    const plan = req.body?.plan === 'subscription' ? 'subscription' : 'once';

    if (DEMO_MODE) {
      console.log(`💡 Demo payment intent requested (${plan})`);
      return res.json({
        clientSecret: 'demo_client_secret_' + Date.now(),
        publishableKey: 'pk_test_demo',
        plan,
      });
    }

    const stripe = getStripe();
    const timestamp = new Date().toISOString();

    if (plan === 'subscription') {
      const priceId = process.env.STRIPE_PRICE_SUBSCRIPTION;
      if (!priceId || priceId.includes('xxxx')) {
        return res.status(400).json({
          error:
            'Missing STRIPE_PRICE_SUBSCRIPTION. Create a $19/month price in Stripe and add the Price ID to .env',
        });
      }

      const customer = await stripe.customers.create({
        metadata: { app: 'prank-flashlight' },
      });

      const ephemeralKey = await stripe.ephemeralKeys.create(
        { customer: customer.id },
        { apiVersion: '2026-07-29.dahlia' }
      );

      // Newer Stripe API exposes client_secret on confirmation_secret, not payment_intent
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: [
          'latest_invoice.confirmation_secret',
          'latest_invoice.payment_intent',
        ],
        metadata: {
          product: 'flashlight_unlimited',
          app: 'prank-flashlight',
          timestamp,
        },
      });

      const invoice =
        typeof subscription.latest_invoice === 'object'
          ? subscription.latest_invoice
          : null;

      const clientSecret =
        invoice?.confirmation_secret?.client_secret ||
        (typeof invoice?.payment_intent === 'object'
          ? invoice.payment_intent?.client_secret
          : null);

      if (!clientSecret) {
        console.error('Subscription missing client secret', {
          subscriptionId: subscription.id,
          invoiceId: invoice?.id,
          hasConfirmationSecret: Boolean(invoice?.confirmation_secret),
          paymentIntentType: typeof invoice?.payment_intent,
        });
        return res.status(500).json({
          error:
            'Could not create subscription payment. Check that the Price ID is a recurring $19/month price in the same Stripe mode (live/test).',
        });
      }

      console.log(`Subscription started: ${subscription.id}`);
      return res.json({
        clientSecret,
        customerId: customer.id,
        ephemeralKey: ephemeralKey.secret,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        plan,
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 9900, // $99.00
      currency: 'usd',
      description: 'Turn flashlight off',
      metadata: {
        product: 'flashlight_off_once',
        app: 'prank-flashlight',
        timestamp,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log(`Payment Intent created: ${paymentIntent.id} - $99`);
    res.json({
      clientSecret: paymentIntent.client_secret,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      plan,
    });
  } catch (error) {
    console.error('❌ Error creating payment intent:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  const mode = DEMO_MODE ? 'DEMO' : IS_LIVE_MODE ? 'LIVE' : 'TEST';
  res.json({
    status: 'ok',
    message: 'Prank Flashlight API is running!',
    mode,
    organizationKey: IS_ORG_KEY,
    hasStripeContext: Boolean(stripeContext),
    environment: process.env.NODE_ENV || 'development',
    warning: IS_LIVE_MODE ? 'Real payments active!' : null,
  });
});

app.post('/refund-payment', async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (DEMO_MODE) {
      return res.json({ success: true, message: 'Demo refund successful' });
    }

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment Intent ID required' });
    }

    const stripe = getStripe();
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });

    console.log(`💸 Refund created: ${refund.id} for payment ${paymentIntentId}`);

    res.json({
      success: true,
      refund: refund.id,
      status: refund.status,
      amount: `$${(refund.amount / 100).toFixed(2)}`,
    });
  } catch (error) {
    console.error('❌ Refund error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Prank Flashlight API running on port ${PORT}`);
  console.log(
    `💡 Mode: ${
      DEMO_MODE
        ? 'DEMO'
        : IS_LIVE_MODE
          ? '💰 LIVE'
          : '🧪 TEST'
    }`
  );
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});
