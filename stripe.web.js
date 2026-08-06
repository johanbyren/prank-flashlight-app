import React from 'react';

export function StripeProvider({ children }) {
  return children;
}

export function useStripe() {
  return {
    initPaymentSheet: async () => ({
      error: { message: 'Stripe stöds inte på web. Använd DEMO-läge eller en mobil enhet.' },
    }),
    presentPaymentSheet: async () => ({
      error: { message: 'Stripe stöds inte på web.' },
    }),
  };
}
