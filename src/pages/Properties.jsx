import React, { useState, useEffect } from "react";
import { Property, RentalApplication, Lease } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Building2, 
  Plus, 
  Search,
  Filter,
  Bed,
  Bath,
  Square,
  DollarSign,
  MapPin,
  Edit,
  Copy,
  Camera,
  X
} from "lucide-react";

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [applications, setApplications] = useState([]);
  const [leases, setLeases] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    priceMin: '',
    priceMax: '',
    beds: 'all',
    pets: 'all'
  });

  const [formData, setFormData] = useState({
    title: '',
    address: '',
    city: '',
    neighbourhood: '',
    beds: '',
    baths: '',
    sqft: '',
    amenities: [],
    photos: [],
    monthly_rent: '',
    status: 'available',
    owner_id: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [properties, filters]);

  const loadData = async () => {
    const [props, apps, leaseList] = await Promise.all([
      Property.list('-created_date'),
      RentalApplication.list(),
      Lease.list()
    ]);
    setProperties(props);
    setApplications(apps);
    setLeases(leaseList);
    setIsLoading(false);
  };

  const applyFilters = () => {
    let filtered = properties;

    if (filters.search) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        p.address.toLowerCase().includes(filters.search.toLowerCase()) ||
        p.city.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(p => p.status === filters.status);
    }

    if (filters.priceMin) {
      filtered = filtered.filter(p => p.monthly_rent >= parseFloat(filters.priceMin));
    }

    if (filters.priceMax) {
      filtered = filtered.filter(p => p.monthly_rent <= parseFloat(filters.priceMax));
    }

    if (filters.beds !== 'all') {
      filtered = filtered.filter(p => p.beds === parseInt(filters.beds));
    }

    if (filters.pets !== 'all') {
      const hasPets = filters.pets === 'yes';
      filtered = filtered.filter(p => p.amenities.includes('pets') === hasPets);
    }

    setFilteredProperties(filtered);
  };

  const resetForm = () => {
    setFormData({
      title: '', address: '', city: '', neighbourhood: '',
      beds: '', baths: '', sqft: '', amenities: [], photos: [],
      monthly_rent: '', status: 'available', owner_id: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const propertyData = {
      ...formData,
      beds: parseInt(formData.beds),
      baths: parseFloat(formData.baths),
      sqft: parseInt(formData.sqft),
      monthly_rent: parseFloat(formData.monthly_rent)
    };

    if (editingProperty) {
      await Property.update(editingProperty.id, propertyData);
    } else {
      await Property.create(propertyData);
    }

    setShowForm(false);
    setEditingProperty(null);
    resetForm();
    loadData();
  };

  const handleEdit = (property) => {
    setEditingProperty(property);
    setFormData({
      ...property,
      beds: property.beds?.toString() || '',
      baths: property.baths?.toString() || '',
      sqft: property.sqft?.toString() || '',
      monthly_rent: property.monthly_rent?.toString() || '',
      amenities: property.amenities || [],
      photos: property.photos || []
    });
    setShowForm(true);
  };

  const handleDuplicate = (property) => {
    setEditingProperty(null);
    setFormData({
      ...property,
      title: `${property.title} (Copy)`,
      beds: property.beds?.toString() || '',
      baths: property.baths?.toString() || '',
      sqft: property.sqft?.toString() || '',
      monthly_rent: property.monthly_rent?.toString() || '',
      amenities: property.amenities || [],
      photos: property.photos || []
    });
    setShowForm(true);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setUploading(true);
    
    try {
      const uploadPromises = files.map(async (file) => {
        try {
          const result = await UploadFile({ file });
          return result.file_url;
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          return null;
        }
      });
      
      const results = await Promise.all(uploadPromises);
      const newImages = results.filter(url => url !== null);
      
      if (newImages.length > 0) {
        setFormData(prev => ({
          ...prev,
          photos: [...prev.photos, ...newImages]
        }));
      }
      
      if (newImages.length < files.length) {
        alert(`${files.length - newImages.length} file(s) failed to upload. Please try again.`);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, index) => index !== indexToRemove)
    }));
  };

  const toggleAmenity = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const getStatusBadge = (status) => {
    const config = {
      available: { bg: 'bg-green-100', text: 'text-green-800' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      leased: { bg: 'bg-blue-100', text: 'text-blue-800' }
    };
    const c = config[status] || config.available;
    return <Badge className={`${c.bg} ${c.text} border-0`}>{status}</Badge>;
  };

  const getPropertyApplications = (propertyId) => {
    return applications.filter(app => app.property_id === propertyId);
  };

  const getPropertyLease = (propertyId) => {
    return leases.find(lease => lease.property_id === propertyId);
  };

  const PropertyCard = ({ property }) => (
    <Card className="hover-lift border-0 shadow-lg bg-white/90 backdrop-blur-sm overflow-hidden">
      {property.photos && property.photos.length > 0 && (
        <div className="h-48 overflow-hidden">
          <img 
            src={property.photos[0]} 
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{property.title}</h3>
          {getStatusBadge(property.status)}
        </div>
        
        <div className="flex items-center text-slate-500 mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm line-clamp-1">{property.address}, {property.city}</span>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
          <div className="flex items-center justify-center text-slate-600">
            <Bed className="w-4 h-4 mr-1" />
            <span className="text-sm">{property.beds}</span>
          </div>
          <div className="flex items-center justify-center text-slate-600">
            <Bath className="w-4 h-4 mr-1" />
            <span className="text-sm">{property.baths}</span>
          </div>
          <div className="flex items-center justify-center text-slate-600">
            <Square className="w-4 h-4 mr-1" />
            <span className="text-sm">{property.sqft}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-green-600">
            ${property.monthly_rent?.toLocaleString()}
            <span className="text-sm text-slate-500">/mo</span>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedProperty(property)}
            >
              View
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEdit(property)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDuplicate(property)}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const PropertyDetailModal = ({ property, onClose }) => {
    const propertyApplications = getPropertyApplications(property.id);
    const propertyLease = getPropertyLease(property.id);

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto border-0 shadow-2xl">
          <CardHeader className="border-b border-slate-200 sticky top-0 bg-white z-10">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl font-bold text-slate-900">
                  {property.title}
                </CardTitle>
                <p className="text-slate-500">{property.address}, {property.city}</p>
              </div>
              <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            {/* Photo Gallery */}
            {property.photos && property.photos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.photos.map((photo, index) => (
                  <img 
                    key={index}
                    src={photo} 
                    alt={`${property.title} ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}

            {/* Property Details */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Property Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Neighbourhood:</span>
                    <span>{property.neighbourhood || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Bedrooms:</span>
                    <span>{property.beds}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Bathrooms:</span>
                    <span>{property.baths}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Square Feet:</span>
                    <span>{property.sqft}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Monthly Rent:</span>
                    <span className="font-semibold">${property.monthly_rent?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {(property.amenities || []).map(amenity => (
                    <Badge key={amenity} variant="secondary" className="capitalize">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Applications */}
            <div>
              <h3 className="font-semibold mb-3">Applications ({propertyApplications.length})</h3>
              {propertyApplications.length === 0 ? (
                <p className="text-slate-500">No applications yet</p>
              ) : (
                <div className="space-y-2">
                  {propertyApplications.map(app => (
                    <div key={app.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="font-medium">Application #{app.id.slice(-6)}</span>
                      <Badge className={
                        app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        app.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {app.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Lease */}
            {propertyLease && (
              <div>
                <h3 className="font-semibold mb-3">Current Lease</h3>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Status:</span>
                      <Badge className="bg-blue-100 text-blue-800">{propertyLease.status}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Monthly Rent:</span>
                      <span>${propertyLease.monthly_rent?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Start Date:</span>
                      <span>{propertyLease.start_date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">End Date:</span>
                      <span>{propertyLease.end_date}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Properties</h1>
          <p className="text-slate-500 mt-1">Manage your property portfolio</p>
        </div>
        <Button
          onClick={() => { setEditingProperty(null); resetForm(); setShowForm(true); }}
          className="luxury-gradient text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Property
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-md bg-white/90 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search properties..."
                className="pl-10"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
            <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="leased">Leased</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Min Price"
              value={filters.priceMin}
              onChange={(e) => setFilters({...filters, priceMin: e.target.value})}
            />
            <Input
              type="number"
              placeholder="Max Price"
              value={filters.priceMax}
              onChange={(e) => setFilters({...filters, priceMax: e.target.value})}
            />
            <Select value={filters.beds} onValueChange={(value) => setFilters({...filters, beds: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Beds" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Beds</SelectItem>
                <SelectItem value="1">1 Bed</SelectItem>
                <SelectItem value="2">2 Beds</SelectItem>
                <SelectItem value="3">3+ Beds</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.pets} onValueChange={(value) => setFilters({...filters, pets: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Pets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                <SelectItem value="yes">Pet Friendly</SelectItem>
                <SelectItem value="no">No Pets</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Property Form */}
      {showForm && (
        <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>
              {editingProperty ? 'Edit Property' : 'Add New Property'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  placeholder="Property Title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
                <Input
                  placeholder="Address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  required
                />
                <Input
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  required
                />
                <Input
                  placeholder="Neighbourhood"
                  value={formData.neighbourhood}
                  onChange={(e) => setFormData({...formData, neighbourhood: e.target.value})}
                />
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                <Input
                  type="number"
                  placeholder="Bedrooms"
                  value={formData.beds}
                  onChange={(e) => setFormData({...formData, beds: e.target.value})}
                  required
                />
                <Input
                  type="number"
                  step="0.5"
                  placeholder="Bathrooms"
                  value={formData.baths}
                  onChange={(e) => setFormData({...formData, baths: e.target.value})}
                  required
                />
                <Input
                  type="number"
                  placeholder="Square Feet"
                  value={formData.sqft}
                  onChange={(e) => setFormData({...formData, sqft: e.target.value})}
                  required
                />
                <Input
                  type="number"
                  placeholder="Monthly Rent ($)"
                  value={formData.monthly_rent}
                  onChange={(e) => setFormData({...formData, monthly_rent: e.target.value})}
                  required
                />
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Amenities</label>
                <div className="grid grid-cols-4 gap-3">
                  {['parking', 'pets', 'balcony', 'laundry', 'gym', 'elevator', 'ac'].map(amenity => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={amenity}
                        checked={formData.amenities.includes(amenity)}
                        onCheckedChange={() => toggleAmenity(amenity)}
                      />
                      <label htmlFor={amenity} className="text-sm capitalize">{amenity}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Photos */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Photos</label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    disabled={uploading}
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Camera className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                    <p className="text-sm text-slate-500">
                      {uploading ? 'Uploading...' : 'Click to upload photos'}
                    </p>
                  </label>
                </div>

                {formData.photos.length > 0 && (
                  <div className="grid grid-cols-4 gap-4 mt-4">
                    {formData.photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={photo}
                          alt={`Property ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingProperty(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="luxury-gradient text-white">
                  {editingProperty ? 'Update Property' : 'Add Property'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Properties Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-slate-200"></div>
              <CardContent className="p-6 space-y-4">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-6 bg-slate-200 rounded"></div>
                  <div className="h-6 bg-slate-200 rounded"></div>
                  <div className="h-6 bg-slate-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredProperties.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <Building2 className="w-16 h-16 mx-auto text-slate-400 mb-6" />
            <h3 className="text-2xl font-semibold text-slate-900 mb-4">No properties found</h3>
            <p className="text-slate-600 mb-6">
              {filters.search || filters.status !== 'all' 
                ? 'Try adjusting your filters.'
                : 'Add your first property to get started.'
              }
            </p>
            <Button onClick={() => setShowForm(true)} className="luxury-gradient text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Property
            </Button>
          </div>
        ) : (
          filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))
        )}
      </div>

      {/* Property Detail Modal */}
      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}
    </div>
  );
}