import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve((_req) => {
  const secretKey = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
  const mode = !secretKey
    ? "DEMO"
    : secretKey.startsWith("sk_live_") || secretKey.startsWith("sk_org_live_")
      ? "LIVE"
      : "TEST";

  return new Response(
    JSON.stringify({
      status: "ok",
      message: "Candela API is running.",
      mode,
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
