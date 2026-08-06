// Backend URL
// Local Express: http://192.168.1.x:3000
// Supabase Edge Functions:
export const API_URL =
  'https://dhciyjcbnddojxwfsrmp.supabase.co/functions/v1';

// Supabase anon/publishable key (required by Edge Function gateway)
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoY2l5amNibmRkb2p4d2Zzcm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwNDQyMjUsImV4cCI6MjEwMTYyMDIyNX0.3QXW7mf6f4qjgK4roeSy2yT9L43tJfi9GE0TcWkmhNQ';

// Stripe publishable key — safe in the app (never put sk_ keys here)
// LIVE — real charges
export const STRIPE_PUBLISHABLE_KEY =
  'pk_live_51U1YAAAluFOw9Evkl7f0YJIiweUo0TdpOYNh2qUVPAMRyE7fzfDhhv1XwoXHUIDxDgBCEhAwJ2btPP0dXuG9QjQx00MZX762XI';
