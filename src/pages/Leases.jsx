import React, { useState, useEffect } from "react";
import { Lease } from "@/api/entities";
import { Property } from "@/api/entities";
import { Client } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileCheck,
  Building2,
  User,
  Calendar,
  DollarSign,
  Search,
  Plus
} from "lucide-react";
import { format } from "date-fns";

export default function Leases() {
  const [leases, setLeases] = useState([]);
  const [properties, setProperties] = useState({});
  const [clients, setClients] = useState({});
  const [filteredLeases, setFilteredLeases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [leases, searchTerm]);

  const loadData = async () => {
    const [leaseList, propList, clientList] = await Promise.all([
      Lease.list('-created_date'),
      Property.list(),
      Client.list()
    ]);
    
    const propMap = propList.reduce((acc, p) => ({ ...acc, [p.id]: p }), {});
    const clientMap = clientList.reduce((acc, c) => ({ ...acc, [c.id]: c }), {});

    setLeases(leaseList);
    setProperties(propMap);
    setClients(clientMap);
    setIsLoading(false);
  };
  
  const applyFilters = () => {
    let filtered = leases;
    if (searchTerm) {
      filtered = filtered.filter(lease => {
        const property = properties[lease.property_id];
        const client = clients[lease.client_id];
        return (
          (property && property.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (client && `${client.first_name} ${client.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      });
    }
    setFilteredLeases(filtered);
  };
  
  const handleStatusChange = async (leaseId, newStatus) => {
    const lease = leases.find(l => l.id === leaseId);
    if (!lease) return;

    await Lease.update(leaseId, { status: newStatus });

    // When a lease ends, set the property back to 'available'
    if (newStatus === 'ended') {
      await Property.update(lease.property_id, { status: 'available' });
    }
    
    loadData();
  };
  
  const getStatusBadge = (status) => {
    const config = {
      active: { bg: 'bg-green-100', text: 'text-green-800' },
      ended: { bg: 'bg-gray-100', text: 'text-gray-800' },
      renewed: { bg: 'bg-blue-100', text: 'text-blue-800' }
    };
    const c = config[status] || config.active;
    return <Badge className={`${c.bg} ${c.text} border-0`}>{status}</Badge>;
  };

  const LeaseCard = ({ lease }) => {
    const property = properties[lease.property_id];
    const client = clients[lease.client_id];
    
    return (
      <Card className="hover-lift border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg text-slate-900">{property?.title || 'N/A'}</CardTitle>
              <p className="text-sm text-slate-500">{client ? `${client.first_name} ${client.last_name}` : 'N/A'}</p>
            </div>
            {getStatusBadge(lease.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>{format(new Date(lease.start_date), 'MMM d, yyyy')} - {format(new Date(lease.end_date), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-slate-500" />
              <span>${lease.monthly_rent?.toLocaleString()}/mo</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-slate-500" />
              <span>${lease.deposit?.toLocaleString()} Deposit</span>
            </div>
             <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>Paid on day {lease.payment_day}</span>
            </div>
          </div>
          {lease.status === 'active' && (
            <div className="flex gap-2 pt-4 border-t border-slate-100">
              <Button size="sm" variant="outline" onClick={() => handleStatusChange(lease.id, 'renewed')}>Renew</Button>
              <Button size="sm" variant="outline" onClick={() => handleStatusChange(lease.id, 'ended')}>End Lease</Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Leases</h1>
          <p className="text-slate-500 mt-1">Manage active and past lease agreements</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by property or client..."
              className="pl-10 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* A button to manually create a lease would go here if needed */}
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => <Card key={i} className="h-48 animate-pulse bg-slate-200" />)
        ) : filteredLeases.length > 0 ? (
          filteredLeases.map(lease => <LeaseCard key={lease.id} lease={lease} />)
        ) : (
          <div className="col-span-full text-center py-16">
            <FileCheck className="w-16 h-16 mx-auto text-slate-400 mb-6" />
            <h3 className="text-2xl font-semibold text-slate-900 mb-4">No leases found</h3>
            <p className="text-slate-600">Approved applications will generate leases here.</p>
          </div>
        )}
      </div>
    </div>
  );
}