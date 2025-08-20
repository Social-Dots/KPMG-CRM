// Mock data for development mode
export const mockProperties = [
  {
    id: 'prop-1',
    title: 'Modern Downtown Apartment',
    address: '123 Main Street',
    city: 'Toronto',
    neighbourhood: 'Downtown',
    beds: 2,
    baths: 2,
    sqft: 1200,
    monthly_rent: 2800,
    status: 'available',
    amenities: ['parking', 'gym', 'elevator', 'ac'],
    photos: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop&crop=center'],
    property_type: 'apartment',
    owner_id: 'owner-1',
    created_date: '2024-01-15T10:00:00Z'
  },
  {
    id: 'prop-2',
    title: 'Cozy Suburban House',
    address: '456 Oak Avenue',
    city: 'Mississauga',
    neighbourhood: 'Streetsville',
    beds: 3,
    baths: 2.5,
    sqft: 1800,
    monthly_rent: 3200,
    status: 'available',
    amenities: ['parking', 'pets', 'balcony', 'laundry'],
    photos: ['https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=800&h=600&fit=crop&crop=center'],
    property_type: 'house',
    owner_id: 'owner-1',
    created_date: '2024-01-10T14:30:00Z'
  },
  {
    id: 'prop-3',
    title: 'Luxury Condo with Lake View',
    address: '789 Lakeshore Drive',
    city: 'Toronto',
    neighbourhood: 'Harbourfront',
    beds: 1,
    baths: 1,
    sqft: 900,
    monthly_rent: 3500,
    status: 'leased',
    amenities: ['parking', 'gym', 'elevator', 'ac', 'balcony'],
    photos: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&crop=center'],
    property_type: 'condo',
    owner_id: 'owner-2',
    created_date: '2024-01-08T09:15:00Z'
  },
  {
    id: 'prop-4',
    title: 'Family Townhouse',
    address: '321 Elm Street',
    city: 'Burlington',
    neighbourhood: 'Aldershot',
    beds: 4,
    baths: 3,
    sqft: 2200,
    monthly_rent: 3800,
    status: 'available',
    amenities: ['parking', 'pets', 'laundry', 'balcony'],
    photos: ['https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&h=600&fit=crop&crop=center'],
    property_type: 'townhouse',
    owner_id: 'owner-1',
    created_date: '2024-01-12T16:45:00Z'
  },
  {
    id: 'prop-5',
    title: 'Studio Loft in Entertainment District',
    address: '555 King Street West',
    city: 'Toronto',
    neighbourhood: 'Entertainment District',
    beds: 0,
    baths: 1,
    sqft: 650,
    monthly_rent: 2200,
    status: 'available',
    amenities: ['gym', 'elevator', 'ac', 'balcony'],
    photos: ['https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&h=600&fit=crop&crop=center'],
    property_type: 'studio',
    owner_id: 'owner-1',
    created_date: '2024-01-20T11:15:00Z'
  },
  {
    id: 'prop-6',
    title: 'Executive 2BR with Parking',
    address: '88 Blue Jays Way',
    city: 'Toronto',
    neighbourhood: 'CityPlace',
    beds: 2,
    baths: 2,
    sqft: 1100,
    monthly_rent: 3200,
    status: 'available',
    amenities: ['parking', 'gym', 'elevator', 'ac', 'balcony', 'laundry'],
    photos: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop&crop=center'],
    property_type: 'apartment',
    owner_id: 'owner-2',
    created_date: '2024-01-18T14:30:00Z'
  }
];

export const mockClients = [
  {
    id: 'client-1',
    first_name: 'Sarah',
    last_name: 'Johnson',
    email: 'sarah.johnson@email.com',
    phone: '(416) 555-0123',
    status: 'active',
    budget_min: 2500,
    budget_max: 3500,
    prefs_text: 'Looking for pet-friendly apartment downtown with parking',
    source: 'portal',
    notes: 'Prefers buildings with gym facilities',
    created_date: '2024-01-20T11:00:00Z'
  },
  {
    id: 'client-2',
    first_name: 'Michael',
    last_name: 'Chen',
    email: 'michael.chen@email.com',
    phone: '(647) 555-0456',
    status: 'active',
    budget_min: 3000,
    budget_max: 4000,
    prefs_text: 'Family with 2 children, need quiet neighborhood',
    source: 'cma',
    notes: 'School district is important',
    created_date: '2024-01-18T14:20:00Z'
  },
  {
    id: 'client-3',
    first_name: 'Emily',
    last_name: 'Rodriguez',
    email: 'emily.rodriguez@email.com',
    phone: '(905) 555-0789',
    status: 'active',
    budget_min: 2000,
    budget_max: 2800,
    prefs_text: 'First-time renter, looking for studio or 1-bedroom',
    source: 'social',
    notes: 'Recent graduate, stable employment',
    created_date: '2024-01-22T09:30:00Z'
  }
];

export const mockApplications = [
  {
    id: 'app-1',
    property_id: 'prop-1',
    user_id: 'client-1',
    client_id: 'client-1',
    status: 'pending',
    score: 8.5,
    docs_complete: 0.9,
    created_date: '2024-01-25T10:00:00Z',
    pay_stubs_urls: ['url1', 'url2', 'url3'],
    credit_report_url: 'credit-url',
    dl_front_url: 'dl-front-url',
    dl_back_url: 'dl-back-url',
    monthly_income_at_application: 6500,
    employer_at_application: 'Tech Corp Inc.'
  },
  {
    id: 'app-2',
    property_id: 'prop-2',
    user_id: 'client-2',
    client_id: 'client-2',
    status: 'approved',
    score: 9.2,
    docs_complete: 1.0,
    created_date: '2024-01-20T15:30:00Z',
    decision_at: '2024-01-22T09:00:00Z',
    pay_stubs_urls: ['url1', 'url2', 'url3'],
    credit_report_url: 'credit-url',
    dl_front_url: 'dl-front-url',
    dl_back_url: 'dl-back-url',
    monthly_income_at_application: 7200,
    employer_at_application: 'Finance Solutions Ltd.'
  },
  {
    id: 'app-3',
    property_id: 'prop-4',
    user_id: 'client-3',
    client_id: 'client-3',
    status: 'denied',
    score: 5.8,
    docs_complete: 0.8,
    created_date: '2024-01-15T12:00:00Z',
    decision_at: '2024-01-18T14:00:00Z',
    pay_stubs_urls: ['url1', 'url2'],
    credit_report_url: 'credit-url',
    dl_front_url: 'dl-front-url',
    dl_back_url: 'dl-back-url',
    monthly_income_at_application: 4200,
    employer_at_application: 'Startup Co.'
  }
];

export const mockLeases = [
  {
    id: 'lease-1',
    property_id: 'prop-3',
    client_id: 'client-1',
    start_date: '2024-02-01',
    end_date: '2025-01-31',
    monthly_rent: 3500,
    deposit: 3500,
    payment_day: 1,
    status: 'active',
    created_date: '2024-01-25T16:00:00Z'
  },
  {
    id: 'lease-2',
    property_id: 'prop-2',
    client_id: 'client-2',
    start_date: '2024-01-15',
    end_date: '2024-12-31',
    monthly_rent: 3200,
    deposit: 3200,
    payment_day: 15,
    status: 'active',
    created_date: '2024-01-10T10:00:00Z'
  }
];

export const mockUsers = [
  {
    id: 'client-1',
    full_name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '(416) 555-0123'
  },
  {
    id: 'client-2',
    full_name: 'Michael Chen',
    email: 'michael.chen@email.com',
    phone: '(647) 555-0456'
  },
  {
    id: 'client-3',
    full_name: 'Emily Rodriguez',
    email: 'emily.rodriguez@email.com',
    phone: '(905) 555-0789'
  }
];

// Mock API functions that simulate the Base44 SDK behavior
export const mockAPI = {
  Property: {
    list: async (sort) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return [...mockProperties];
    },
    get: async (id) => {
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockProperties.find(p => p.id === id);
    },
    create: async (data) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const newProperty = {
        ...data,
        id: `prop-${Date.now()}`,
        created_date: new Date().toISOString()
      };
      mockProperties.push(newProperty);
      return newProperty;
    },
    update: async (id, data) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockProperties.findIndex(p => p.id === id);
      if (index !== -1) {
        mockProperties[index] = { ...mockProperties[index], ...data };
        return mockProperties[index];
      }
      throw new Error('Property not found');
    }
  },
  
  Client: {
    list: async (sort) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return [...mockClients];
    },
    create: async (data) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const newClient = {
        ...data,
        id: `client-${Date.now()}`,
        created_date: new Date().toISOString()
      };
      mockClients.push(newClient);
      return newClient;
    }
  },

  RentalApplication: {
    list: async (sort) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return [...mockApplications];
    },
    create: async (data) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const newApp = {
        ...data,
        id: `app-${Date.now()}`,
        created_date: new Date().toISOString()
      };
      mockApplications.push(newApp);
      return newApp;
    },
    update: async (id, data) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockApplications.findIndex(a => a.id === id);
      if (index !== -1) {
        mockApplications[index] = { ...mockApplications[index], ...data };
        return mockApplications[index];
      }
      throw new Error('Application not found');
    }
  },

  Lease: {
    list: async (sort) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return [...mockLeases];
    },
    create: async (data) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const newLease = {
        ...data,
        id: `lease-${Date.now()}`,
        created_date: new Date().toISOString()
      };
      mockLeases.push(newLease);
      return newLease;
    },
    update: async (id, data) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockLeases.findIndex(l => l.id === id);
      if (index !== -1) {
        mockLeases[index] = { ...mockLeases[index], ...data };
        return mockLeases[index];
      }
      throw new Error('Lease not found');
    }
  },

  User: {
    list: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return [...mockUsers];
    }
  }
};