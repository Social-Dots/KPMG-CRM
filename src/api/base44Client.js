import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with environment-based authentication
const isDevelopment = import.meta.env.DEV;

export const base44 = createClient({
  appId: "68981a3b06804fba1adabc85", 
  requiresAuth: !isDevelopment // Disabled in development, enabled in production
});
