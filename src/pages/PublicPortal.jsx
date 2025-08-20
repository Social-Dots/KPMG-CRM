import React, { useState, useEffect } from "react";
import { Property } from "@/api/entities";
import { Client } from "@/api/entities";
import { Lease } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { createPageUrl } from "@/utils";
import { Link, useNavigate } from "react-router-dom";
import { 
  Building2, 
  Bed,
  Bath,
  Square,
  MapPin,
  Search,
  Heart
} from "lucide-react";

export default function PublicPortal() {
  const [properties, setProperties] = useState([]);
  const [leases, setLeases] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    search: '',
    priceMin: '',
    priceMax: '',
    beds: 'all',
    pets: 'all',
    neighbourhood: 'all'
  });

  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [properties, leases, filters]);

  const loadData = async () => {
    setIsLoading(true);
    const [props, leaseList] = await Promise.all([
      Property.list('-created_date'),
      Lease.list()
    ]);
    setProperties(props);
    setLeases(leaseList);
    setIsLoading(false);
  };

  const applyFilters = () => {
    let filtered = properties.filter(p => p.status !== 'leased');
    
    // Leased properties filtered separately for waitlist
    let leasedFiltered = properties.filter(p => p.status === 'leased');

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const filterFn = p =>
        p.title.toLowerCase().includes(searchLower) ||
        p.address.toLowerCase().includes(searchLower) ||
        p.city.toLowerCase().includes(searchLower) ||
        (p.neighbourhood && p.neighbourhood.toLowerCase().includes(searchLower));
        
      filtered = filtered.filter(filterFn);
      leasedFiltered = leasedFiltered.filter(filterFn);
    }

    if (filters.priceMin) {
      filtered = filtered.filter(p => p.monthly_rent >= parseFloat(filters.priceMin));
      leasedFiltered = leasedFiltered.filter(p => p.monthly_rent >= parseFloat(filters.priceMin));
    }

    if (filters.priceMax) {
      filtered = filtered.filter(p => p.monthly_rent <= parseFloat(filters.priceMax));
      leasedFiltered = leasedFiltered.filter(p => p.monthly_rent <= parseFloat(filters.priceMax));
    }

    if (filters.beds !== 'all') {
      const bedsInt = parseInt(filters.beds);
      const bedFilterFn = p => (bedsInt === 4 ? p.beds >= 4 : p.beds === bedsInt);
      filtered = filtered.filter(bedFilterFn);
      leasedFiltered = leasedFiltered.filter(bedFilterFn);
    }

    if (filters.pets !== 'all') {
      const hasPets = filters.pets === 'yes';
      const petsFilterFn = p => p.amenities.includes('pets') === hasPets;
      filtered = filtered.filter(petsFilterFn);
      leasedFiltered = leasedFiltered.filter(petsFilterFn);
    }

    if (filters.neighbourhood !== 'all') {
      const neighbourhoodFilterFn = p => p.neighbourhood === filters.neighbourhood;
      filtered = filtered.filter(neighbourhoodFilterFn);
      leasedFiltered = leasedFiltered.filter(neighbourhoodFilterFn);
    }

    setFilteredProperties([...filtered, ...leasedFiltered]);
  };

  const handleApply = async (propertyId) => {
    // In development mode, skip authentication
    const isDevelopment = import.meta.env.DEV;
    
    if (isDevelopment) {
      navigate(`/ApplyForRental?propertyId=${propertyId}`);
      return;
    }

    try {
      await User.me();
      navigate(`/ApplyForRental?propertyId=${propertyId}`);
    } catch (error) {
      // Not logged in, redirect to login then back to application
      const callbackUrl = window.location.origin + `/ApplyForRental?propertyId=${propertyId}`;
      await User.loginWithRedirect(callbackUrl);
    }
  };

  const handleJoinWaitlist = async (property) => {
    const email = prompt(`This property is currently leased. To join the waitlist for ${property.title}, please enter your email address:`);
    if (email) {
      try {
        await Client.create({
          first_name: "Waitlist Lead",
          last_name: `for ${property.id}`,
          email: email,
          phone: "N/A",
          source: 'portal',
          prefs_text: `Waitlisted for property: ${property.title} (${property.address})`
        });
        alert("Thank you! You've been added to the waitlist and will be notified if this property becomes available.");
      } catch (e) {
        alert("An error occurred. Please try again.");
      }
    }
  };
  
  const PropertyCard = ({ property }) => {
    const activeLease = leases.find(l => l.property_id === property.id && l.status === 'active');

    return (
      <Card className="hover-lift border-muted shadow-lg bg-card overflow-hidden group">
        <div className="relative">
          {property.photos && property.photos.length > 0 ? (
            <div className="h-56 overflow-hidden">
              <img 
                src={property.photos[0]} 
                alt={property.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          ) : (
            <div className="h-56 bg-muted flex items-center justify-center">
              <Building2 className="w-12 h-12 text-muted" />
            </div>
          )}
          <div className="absolute top-4 right-4">
            <Button size="icon" variant="secondary" className="bg-card hover:bg-muted shadow-lg focus-brand">
              <Heart className="w-4 h-4" />
            </Button>
          </div>
          <div className="absolute bottom-4 left-4">
            {activeLease ? (
              <Badge className="status-denied font-semibold border-0">
                Leased until {format(new Date(activeLease.end_date), 'MMM yyyy')}
              </Badge>
            ) : (
              <Badge className="status-approved font-semibold border-0">
                Available Now
              </Badge>
            )}
          </div>
        </div>
        
        <CardContent className="p-6">
          <div className="mb-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold text-xl text-primary group-hover:text-brand-primary transition-colors line-clamp-1">
                {property.title}
              </h3>
              <div className="text-right">
                <div className="text-2xl font-bold" style={{color: 'var(--brand-secondary)'}}>
                  ${property.monthly_rent?.toLocaleString()}
                </div>
                <div className="text-sm text-secondary">CAD/month</div>
              </div>
            </div>
            
            <div className="flex items-center text-secondary mb-3">
              <MapPin className="w-4 h-4 mr-2" />
              <span className="line-clamp-1">{property.address}, {property.city}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-muted rounded-lg">
              <Bed className="w-5 h-5 mx-auto text-secondary mb-1" />
              <div className="text-sm font-medium text-primary">{property.beds}</div>
              <div className="text-xs text-muted">Bedrooms</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <Bath className="w-5 h-5 mx-auto text-secondary mb-1" />
              <div className="text-sm font-medium text-primary">{property.baths}</div>
              <div className="text-xs text-muted">Bathrooms</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <Square className="w-5 h-5 mx-auto text-secondary mb-1" />
              <div className="text-sm font-medium text-primary">{property.sqft}</div>
              <div className="text-xs text-muted">Sq Ft</div>
            </div>
          </div>

          {activeLease ? (
            <Button 
              onClick={() => handleJoinWaitlist(property)}
              className="w-full bg-muted text-secondary hover:bg-border-muted focus-brand"
            >
              Join Waitlist
            </Button>
          ) : (
            <Button 
              onClick={() => handleApply(property.id)}
              className="w-full btn-primary focus-brand hover:shadow-lg"
            >
              Apply Now
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  const neighbourhoods = [...new Set(properties.map(p => p.neighbourhood).filter(Boolean))];

  return (
    <div className="min-h-screen bg-base">
      <header className="bg-card shadow-xl border-b-4" style={{borderBottomColor: 'var(--brand-secondary)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to={createPageUrl("PublicPortal")} className="flex items-center space-x-4" style={{padding: '16px 0'}}>
              <div className="h-12 md:h-12 w-auto bg-primary rounded flex items-center justify-center px-4">
                <span className="text-white font-bold text-lg">KPMG CRM</span>
              </div>
            </Link>
            <div>
              <p className="text-muted text-sm">Premium Rental Solutions</p>
            </div>
          </div>
        </div>
      </header>

      <section className="py-20 px-4" style={{
        background: `linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%)`
      }}>
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            Find Your Perfect Home
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Discover premium rental properties with quality homes, exceptional service, and seamless application process.
          </p>
        </div>
      </section>

      <section className="px-4 pb-8 -mt-20">
        <div className="max-w-7xl mx-auto">
          <Card className="border-muted shadow-lg bg-card">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-6 gap-4">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted" />
                  <Input
                    placeholder="Search by title, address, city, or neighbourhood..."
                    className="pl-10 border-muted focus:border-brand-primary"
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                  />
                </div>
                <Select value={filters.neighbourhood} onValueChange={(value) => setFilters({...filters, neighbourhood: value})}>
                  <SelectTrigger className="border-muted focus:border-brand-primary">
                    <SelectValue placeholder="Neighbourhood" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Neighbourhoods</SelectItem>
                    {neighbourhoods.map(n => (
                      <SelectItem key={n} value={n}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                 <Input
                  type="number"
                  placeholder="Min $"
                  className="border-muted focus:border-brand-primary"
                  value={filters.priceMin}
                  onChange={(e) => setFilters({...filters, priceMin: e.target.value})}
                />
                <Input
                  type="number"
                  placeholder="Max $"
                  className="border-muted focus:border-brand-primary"
                  value={filters.priceMax}
                  onChange={(e) => setFilters({...filters, priceMax: e.target.value})}
                />
                <Select value={filters.beds} onValueChange={(value) => setFilters({...filters, beds: value})}>
                  <SelectTrigger className="border-muted focus:border-brand-primary">
                    <SelectValue placeholder="Beds" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Beds</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-primary">Available Properties</h2>
              <p className="text-secondary mt-1">
                {isLoading ? 'Loading...' : `${filteredProperties.length} properties found`}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <Card key={i} className="animate-pulse border-muted">
                  <div className="h-56 bg-muted"></div>
                  <CardContent className="p-6 space-y-4">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-16 bg-muted rounded"></div>
                      <div className="h-16 bg-muted rounded"></div>
                      <div className="h-16 bg-muted rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredProperties.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <Building2 className="w-16 h-16 mx-auto text-muted mb-6" />
                <h3 className="text-2xl font-semibold text-primary mb-4">No properties found</h3>
                <p className="text-secondary mb-6">Try adjusting your search criteria to find more options.</p>
                <Button 
                  onClick={() => setFilters({
                    search: '', priceMin: '', priceMax: '', beds: 'all', pets: 'all', neighbourhood: 'all'
                  })}
                  variant="outline"
                  className="border-muted text-secondary hover:bg-muted"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              filteredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}