import { base44 } from './base44Client';
import { mockAPI } from './mockData';

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV;

// Use mock API in development, real API in production
export const Property = isDevelopment ? mockAPI.Property : base44.entities.Property;

export const RentalApplication = isDevelopment ? mockAPI.RentalApplication : base44.entities.RentalApplication;

export const Client = isDevelopment ? mockAPI.Client : base44.entities.Client;

export const Lease = isDevelopment ? mockAPI.Lease : base44.entities.Lease;

export const User = isDevelopment ? mockAPI.User : base44.auth;