import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@18";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getStripe() {
  const secretKey = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
  if (!secretKey || secretKey.includes("placeholder")) {
    throw new Error("Missing STRIPE_SECRET_KEY secret");
  }

  const stripeContext =
    Deno.env.get("STRIPE_CONTEXT") || Deno.env.get("STRIPE_ACCOUNT_ID") || "";
  const isOrgKey = secretKey.startsWith("sk_org_");

  if (isOrgKey && !stripeContext) {
    throw new Error(
      "Organization API keys require STRIPE_CONTEXT (acct_...).",
    );
  }

  // FetchHttpClient in Deno does not always forward constructor stripeContext;
  // inject Stripe-Context on every request for Organization keys.
  const httpClient = Stripe.createFetchHttpClient(
    stripeContext
      ? (input, init = {}) => {
          const headers = new Headers(init.headers);
          headers.set("Stripe-Context", stripeContext);
          return fetch(input, { ...init, headers });
        }
      : undefined,
  );

  return new Stripe(secretKey, {
    apiVersion: "2025-04-30.basil",
    ...(stripeContext ? { stripeContext } : {}),
    httpClient,
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const body = await req.json().catch(() => ({}));
    const plan = body?.plan === "subscription" ? "subscription" : "once";
    const stripe = getStripe();
    const publishableKey = Deno.env.get("STRIPE_PUBLISHABLE_KEY") ?? "";
    const timestamp = new Date().toISOString();

    if (plan === "subscription") {
      const priceId = Deno.env.get("STRIPE_PRICE_SUBSCRIPTION") ?? "";
      if (!priceId || priceId.includes("xxxx")) {
        return json(
          {
            error:
              "Missing STRIPE_PRICE_SUBSCRIPTION. Create a $19/month price in Stripe and set it as a secret.",
          },
          400,
        );
      }

      const customer = await stripe.customers.create({
        metadata: { app: "prank-flashlight" },
      });

      const ephemeralKey = await stripe.ephemeralKeys.create(
        { customer: customer.id },
        { apiVersion: "2025-04-30.basil" },
      );

      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: priceId }],
        payment_behavior: "default_incomplete",
        payment_settings: { save_default_payment_method: "on_subscription" },
        expand: [
          "latest_invoice.confirmation_secret",
          "latest_invoice.payment_intent",
        ],
        metadata: {
          product: "flashlight_unlimited",
          app: "prank-flashlight",
          timestamp,
        },
      });

      const invoice =
        typeof subscription.latest_invoice === "object"
          ? subscription.latest_invoice
          : null;

      const clientSecret =
        invoice?.confirmation_secret?.client_secret ||
        (typeof invoice?.payment_intent === "object"
          ? invoice.payment_intent?.client_secret
          : null);

      if (!clientSecret) {
        return json(
          {
            error:
              "Could not create subscription payment. Check STRIPE_PRICE_SUBSCRIPTION.",
          },
          500,
        );
      }

      return json({
        clientSecret,
        customerId: customer.id,
        ephemeralKey: ephemeralKey.secret,
        publishableKey,
        plan,
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 9900,
      currency: "usd",
      description: "Turn flashlight off",
      metadata: {
        product: "flashlight_off_once",
        app: "prank-flashlight",
        timestamp,
      },
      automatic_payment_methods: { enabled: true },
    });

    return json({
      clientSecret: paymentIntent.client_secret,
      publishableKey,
      plan,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("create-payment-intent error:", message);
    return json({ error: message }, 500);
  }
});
