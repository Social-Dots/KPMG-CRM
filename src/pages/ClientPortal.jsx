import React, { useState, useEffect } from "react";
import { Property } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Bed,
  Bath,
  Square,
  DollarSign,
  MapPin,
  Calendar,
  Search,
  Filter,
  Heart,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

export default function ClientPortal() {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    property_type: 'all',
    min_price: '',
    max_price: '',
    bedrooms: 'all',
    bathrooms: 'all'
  });

  useEffect(() => {
    loadProperties();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [properties, filters]);

  const loadProperties = async () => {
    const data = await Property.filter({ status: 'available' }, '-created_date');
    setProperties(data);
    setIsLoading(false);
  };

  const applyFilters = () => {
    let filtered = properties;

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        property.address.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Property type filter
    if (filters.property_type !== 'all') {
      filtered = filtered.filter(property => property.property_type === filters.property_type);
    }

    // Price filters
    if (filters.min_price) {
      filtered = filtered.filter(property => property.rent_amount >= parseFloat(filters.min_price));
    }
    if (filters.max_price) {
      filtered = filtered.filter(property => property.rent_amount <= parseFloat(filters.max_price));
    }

    // Bedroom filter
    if (filters.bedrooms !== 'all') {
      filtered = filtered.filter(property => property.bedrooms === parseInt(filters.bedrooms));
    }

    // Bathroom filter
    if (filters.bathrooms !== 'all') {
      filtered = filtered.filter(property => property.bathrooms >= parseFloat(filters.bathrooms));
    }

    setFilteredProperties(filtered);
  };

  const PropertyCard = ({ property }) => (
    <Card className="hover-lift border-0 shadow-lg bg-white/95 backdrop-blur-sm overflow-hidden group">
      <div className="relative">
        {property.images && property.images.length > 0 ? (
          <div className="h-56 overflow-hidden">
            <img 
              src={property.images[0]} 
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        ) : (
          <div className="h-56 bg-slate-200 flex items-center justify-center">
            <Building2 className="w-12 h-12 text-slate-400" />
          </div>
        )}
        <div className="absolute top-4 right-4">
          <Button size="icon" variant="secondary" className="bg-white/90 hover:bg-white">
            <Heart className="w-4 h-4" />
          </Button>
        </div>
        <div className="absolute bottom-4 left-4">
          <Badge className="bg-white/90 text-slate-900 font-semibold">
            Available Now
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-xl text-slate-900 group-hover:text-blue-600 transition-colors">
              {property.title}
            </h3>
            <div className="text-right">
              <div className="text-2xl font-bold gold-accent">
                ${property.rent_amount?.toLocaleString()}
              </div>
              <div className="text-sm text-slate-500">per month</div>
            </div>
          </div>
          
          <div className="flex items-center text-slate-500 mb-3">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{property.address}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <Bed className="w-5 h-5 mx-auto text-slate-600 mb-1" />
            <div className="text-sm font-medium text-slate-900">{property.bedrooms}</div>
            <div className="text-xs text-slate-500">Bedrooms</div>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <Bath className="w-5 h-5 mx-auto text-slate-600 mb-1" />
            <div className="text-sm font-medium text-slate-900">{property.bathrooms}</div>
            <div className="text-xs text-slate-500">Bathrooms</div>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <Square className="w-5 h-5 mx-auto text-slate-600 mb-1" />
            <div className="text-sm font-medium text-slate-900">{property.square_footage}</div>
            <div className="text-xs text-slate-500">Sq Ft</div>
          </div>
        </div>

        {property.amenities && property.amenities.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {property.amenities.slice(0, 3).map((amenity) => (
                <Badge key={amenity} variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                  {amenity}
                </Badge>
              ))}
              {property.amenities.length > 3 && (
                <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-600">
                  +{property.amenities.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1 hover:bg-slate-50"
          >
            View Details
          </Button>
          <Link 
            to={createPageUrl(`ApplyForRental?property_id=${property.id}`)}
            className="flex-1"
          >
            <Button className="w-full luxury-gradient text-white hover:shadow-lg">
              Apply Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            Find Your Perfect Home
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Discover premium rental properties with Kabani Properties. 
            Quality homes, exceptional service, seamless application process.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by location or property name"
                  className="pl-10 bg-white border-0 focus:ring-2 focus:ring-yellow-400"
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                />
              </div>
              <Select value={filters.property_type} onValueChange={(value) => setFilters({...filters, property_type: value})}>
                <SelectTrigger className="bg-white border-0">
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="condo">Condo</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                  <SelectItem value="studio">Studio</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Input
                  placeholder="Min Price"
                  type="number"
                  className="bg-white border-0"
                  value={filters.min_price}
                  onChange={(e) => setFilters({...filters, min_price: e.target.value})}
                />
                <Input
                  placeholder="Max Price"
                  type="number"
                  className="bg-white border-0"
                  value={filters.max_price}
                  onChange={(e) => setFilters({...filters, max_price: e.target.value})}
                />
              </div>
              <Button className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Properties Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Available Properties</h2>
              <p className="text-slate-600 mt-1">
                {isLoading ? 'Loading...' : `${filteredProperties.length} properties available`}
              </p>
            </div>
          </div>

          {/* Properties Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-56 bg-slate-200"></div>
                  <CardContent className="p-6 space-y-4">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-16 bg-slate-200 rounded"></div>
                      <div className="h-16 bg-slate-200 rounded"></div>
                      <div className="h-16 bg-slate-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredProperties.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <Building2 className="w-16 h-16 mx-auto text-slate-400 mb-6" />
                <h3 className="text-2xl font-semibold text-slate-900 mb-4">No properties found</h3>
                <p className="text-slate-600 mb-6">Try adjusting your search criteria to find more options.</p>
                <Button 
                  onClick={() => setFilters({
                    search: '', property_type: 'all', min_price: '', max_price: '', bedrooms: 'all', bathrooms: 'all'
                  })}
                  variant="outline"
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

      {/* CTA Section */}
      <section className="py-16 px-4 bg-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Find Your Next Home?
          </h2>
          <p className="text-slate-300 text-lg mb-8">
            Join thousands of satisfied tenants who found their perfect rental with Kabani Properties.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold">
              Browse All Properties
            </Button>
            <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
              Contact Our Team
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}