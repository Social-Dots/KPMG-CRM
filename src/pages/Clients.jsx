import React, { useState, useEffect } from "react";
import { Client } from "@/api/entities";
import { RentalApplication } from "@/api/entities";
import { Property } from "@/api/entities";
import { Lease } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  User,
  Mail,
  Phone,
  DollarSign,
  Search,
  Plus,
  AlertTriangle,
  Building2,
  Calendar
} from "lucide-react";
import { format } from "date-fns";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [applications, setApplications] = useState([]);
  const [properties, setProperties] = useState([]);
  const [leases, setLeases] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState('');
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    status: 'active',
    budget_min: '',
    budget_max: '',
    prefs_text: '',
    source: 'manual',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [clients, searchTerm]);

  useEffect(() => {
    checkDuplicateEmail();
  }, [formData.email, clients]);

  const loadData = async () => {
    const [clientList, appList, propList, leaseList] = await Promise.all([
      Client.list('-created_date'),
      RentalApplication.list(),
      Property.list(),
      Lease.list()
    ]);
    
    setClients(clientList);
    setApplications(appList);
    setProperties(propList);
    setLeases(leaseList);
    setIsLoading(false);
  };

  const applyFilters = () => {
    let filtered = clients;

    if (searchTerm) {
      filtered = filtered.filter(client =>
        `${client.first_name} ${client.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm)
      );
    }

    setFilteredClients(filtered);
  };

  const checkDuplicateEmail = () => {
    if (formData.email && clients.some(client => client.email === formData.email)) {
      setDuplicateWarning('A client with this email already exists');
    } else {
      setDuplicateWarning('');
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '', last_name: '', email: '', phone: '', status: 'active',
      budget_min: '', budget_max: '', prefs_text: '', source: 'manual', notes: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (duplicateWarning) return;
    
    const clientData = {
      ...formData,
      budget_min: formData.budget_min ? parseFloat(formData.budget_min) : undefined,
      budget_max: formData.budget_max ? parseFloat(formData.budget_max) : undefined
    };
    
    await Client.create(clientData);
    setShowForm(false);
    resetForm();
    loadData();
  };

  const getClientStage = (clientId) => {
    const clientApps = applications.filter(app => app.client_id === clientId);
    const clientLease = leases.find(lease => lease.client_id === clientId && lease.status === 'active');
    
    if (clientLease) return { stage: 'Leased', color: 'bg-blue-100 text-blue-800' };
    if (clientApps.some(app => app.status === 'approved')) return { stage: 'Applied', color: 'bg-purple-100 text-purple-800' };
    if (clientApps.length > 0) return { stage: 'Applied', color: 'bg-purple-100 text-purple-800' };
    return { stage: 'Lead', color: 'bg-gray-100 text-gray-800' };
  };

  const getClientApplications = (clientId) => {
    return applications.filter(app => app.client_id === clientId);
  };

  const getClientLease = (clientId) => {
    return leases.find(lease => lease.client_id === clientId && lease.status === 'active');
  };

  const getMatchingProperties = (client) => {
    return properties.filter(prop => 
      prop.status === 'available' &&
      (!client.budget_min || prop.monthly_rent >= client.budget_min) &&
      (!client.budget_max || prop.monthly_rent <= client.budget_max)
    ).slice(0, 3);
  };

  const ClientCard = ({ client }) => {
    const stage = getClientStage(client.id);
    const clientApplications = getClientApplications(client.id);
    const clientLease = getClientLease(client.id);
    
    return (
      <Card className="hover-lift border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-lg text-slate-900">
                {client.first_name} {client.last_name}
              </h3>
              <p className="text-sm text-slate-500">{client.email}</p>
            </div>
            <Badge className={`${stage.color} border-0`}>
              {stage.stage}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center text-slate-600">
              <Mail className="w-4 h-4 mr-2" />
              <span className="text-sm truncate">{client.email}</span>
            </div>
            <div className="flex items-center text-slate-600">
              <Phone className="w-4 h-4 mr-2" />
              <span className="text-sm">{client.phone}</span>
            </div>
            <div className="flex items-center text-slate-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="text-sm">{format(new Date(client.created_date), 'MMM d')}</span>
            </div>
            <div className="flex items-center text-slate-600">
              <DollarSign className="w-4 h-4 mr-2" />
              <span className="text-sm">
                {client.budget_min && client.budget_max 
                  ? `$${client.budget_min?.toLocaleString()}-$${client.budget_max?.toLocaleString()}`
                  : 'No budget set'
                }
              </span>
            </div>
          </div>

          {client.prefs_text && (
            <div className="p-3 bg-slate-50 rounded-lg mb-4">
              <p className="text-sm text-slate-700 line-clamp-2">{client.prefs_text}</p>
            </div>
          )}

          <div className="flex justify-between items-center">
            <div className="text-sm text-slate-500">
              {clientApplications.length} applications • Source: {client.source}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedClient(client)}
            >
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ClientDetailModal = ({ client, onClose }) => {
    const clientApplications = getClientApplications(client.id);
    const clientLease = getClientLease(client.id);
    const matchingProperties = getMatchingProperties(client);
    
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto border-0 shadow-2xl">
          <CardHeader className="border-b border-slate-200 sticky top-0 bg-white z-10">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl font-bold text-slate-900">
                  {client.first_name} {client.last_name}
                </CardTitle>
                <p className="text-slate-500">{client.email}</p>
              </div>
              <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            {/* Client Information */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Client Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-slate-600">Phone</p>
                  <p className="font-medium">{client.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Status</p>
                  <Badge className={client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {client.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Budget Range</p>
                  <p className="font-medium">
                    {client.budget_min && client.budget_max 
                      ? `$${client.budget_min?.toLocaleString()} - $${client.budget_max?.toLocaleString()}`
                      : 'Not specified'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Source</p>
                  <p className="font-medium capitalize">{client.source}</p>
                </div>
              </div>
              
              {client.prefs_text && (
                <div className="mt-4">
                  <p className="text-sm text-slate-600 mb-2">Preferences</p>
                  <p className="font-medium bg-slate-50 p-3 rounded-lg">{client.prefs_text}</p>
                </div>
              )}
              
              {client.notes && (
                <div className="mt-4">
                  <p className="text-sm text-slate-600 mb-2">Notes</p>
                  <p className="font-medium bg-slate-50 p-3 rounded-lg">{client.notes}</p>
                </div>
              )}
            </div>

            {/* Applications */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Applications ({clientApplications.length})
              </h3>
              {clientApplications.length === 0 ? (
                <p className="text-slate-500">No applications submitted</p>
              ) : (
                <div className="space-y-3">
                  {clientApplications.map(app => {
                    const property = properties.find(p => p.id === app.property_id);
                    return (
                      <div key={app.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium">{property?.title || 'Unknown Property'}</p>
                          <p className="text-sm text-slate-500">
                            Applied {format(new Date(app.created_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <Badge className={
                          app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          app.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {app.status}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Current Lease */}
            {clientLease && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Current Lease</h3>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600">Monthly Rent</p>
                      <p className="font-medium">${clientLease.monthly_rent?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Lease Period</p>
                      <p className="font-medium">{clientLease.start_date} to {clientLease.end_date}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Property Matches */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Matching Properties ({matchingProperties.length})
              </h3>
              {matchingProperties.length === 0 ? (
                <p className="text-slate-500">No matching properties available</p>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {matchingProperties.map(property => (
                    <div key={property.id} className="p-4 border border-slate-200 rounded-lg">
                      <h4 className="font-medium text-slate-900">{property.title}</h4>
                      <p className="text-sm text-slate-500 mb-2">{property.address}, {property.city}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-green-600 font-semibold">
                          ${property.monthly_rent?.toLocaleString()}/mo
                        </span>
                        <Badge className="bg-gray-100 text-gray-800">
                          {property.beds} bed • {property.baths} bath
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
          <h1 className="text-3xl font-bold text-slate-900">Clients</h1>
          <p className="text-slate-500 mt-1">Manage your client relationships</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search clients..."
              className="pl-10 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="luxury-gradient text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Client
          </Button>
        </div>
      </div>

      {/* Add Client Form */}
      {showForm && (
        <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Add New Client</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {duplicateWarning && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{duplicateWarning}</AlertDescription>
                </Alert>
              )}
              
              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  placeholder="First Name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  required
                />
                <Input
                  placeholder="Last Name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  required
                />
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
                <Input
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <Input
                  type="number"
                  placeholder="Min Budget ($)"
                  value={formData.budget_min}
                  onChange={(e) => setFormData({...formData, budget_min: e.target.value})}
                />
                <Input
                  type="number"
                  placeholder="Max Budget ($)"
                  value={formData.budget_max}
                  onChange={(e) => setFormData({...formData, budget_max: e.target.value})}
                />
                <Select value={formData.source} onValueChange={(value) => setFormData({...formData, source: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Lead Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portal">Portal</SelectItem>
                    <SelectItem value="cma">CMA</SelectItem>
                    <SelectItem value="agentlocator">Agent Locator</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Textarea
                placeholder="Client preferences (location, amenities, etc.)"
                value={formData.prefs_text}
                onChange={(e) => setFormData({...formData, prefs_text: e.target.value})}
                rows={3}
              />
              
              <Textarea
                placeholder="Internal notes about this client"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={2}
              />
              
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="luxury-gradient text-white"
                  disabled={!!duplicateWarning}
                >
                  Add Client
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Clients Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 space-y-4">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-6 bg-slate-200 rounded"></div>
                  <div className="h-6 bg-slate-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredClients.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <Users className="w-16 h-16 mx-auto text-slate-400 mb-6" />
            <h3 className="text-2xl font-semibold text-slate-900 mb-4">
              {searchTerm ? 'No clients found' : 'No clients yet'}
            </h3>
            <p className="text-slate-600 mb-6">
              {searchTerm 
                ? 'Try adjusting your search term.'
                : 'Add your first client to get started.'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowForm(true)} className="luxury-gradient text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Client
              </Button>
            )}
          </div>
        ) : (
          filteredClients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))
        )}
      </div>

      {/* Client Detail Modal */}
      {selectedClient && (
        <ClientDetailModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
        />
      )}
    </div>
  );
}