import React, { useState, useEffect } from "react";
import { RentalApplication } from "@/api/entities";
import { Property } from "@/api/entities";
import { User } from "@/api/entities";
import { Lease } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Mail,
  Phone,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Download
} from "lucide-react";
import { format, differenceInDays } from "date-fns";

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [properties, setProperties] = useState({});
  const [users, setUsers] = useState({});
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'
  const [leases, setLeases] = useState([]);

  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    scoreMin: '',
    scoreMax: '',
    agingDays: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applications, filters]);

  const loadData = async () => {
    const [apps, props, userList, leaseList] = await Promise.all([
      RentalApplication.list('-created_date'),
      Property.list(),
      User.list(),
      Lease.list()
    ]);

    const propertyMap = props.reduce((acc, p) => ({...acc, [p.id]: p}), {});
    const userMap = userList.reduce((acc, u) => ({...acc, [u.id]: u}), {});

    setApplications(apps);
    setProperties(propertyMap);
    setUsers(userMap);
    setLeases(leaseList);
    setIsLoading(false);
  };

  const applyFilters = () => {
    let filtered = applications;

    if (filters.search) {
      filtered = filtered.filter(app => {
        const user = users[app.user_id];
        const property = properties[app.property_id];
        return (user && (
          user.full_name.toLowerCase().includes(filters.search.toLowerCase()) ||
          user.email.toLowerCase().includes(filters.search.toLowerCase())
        )) || (property && property.title.toLowerCase().includes(filters.search.toLowerCase()));
      });
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(app => app.status === filters.status);
    }

    if (filters.scoreMin) {
      filtered = filtered.filter(app => app.score >= parseFloat(filters.scoreMin));
    }

    if (filters.scoreMax) {
      filtered = filtered.filter(app => app.score <= parseFloat(filters.scoreMax));
    }

    if (filters.agingDays) {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(filters.agingDays));
      filtered = filtered.filter(app =>
        app.status === 'pending' && new Date(app.created_date) < daysAgo
      );
    }

    setFilteredApplications(filtered);
  };

  const updateApplicationStatus = async (application, newStatus) => {
    if (!application) return;

    if (newStatus === 'approved') {
      const activeLeaseExists = leases.some(l => l.property_id === application.property_id && l.status === 'active');
      if (activeLeaseExists) {
        alert("Error: This property already has an active lease. Please end the current lease before creating a new one.");
        return;
      }
    }

    await RentalApplication.update(application.id, {
      status: newStatus,
      decision_at: new Date().toISOString()
    });

    if (newStatus === 'approved') {
      await Property.update(application.property_id, { status: 'leased' });
      const property = properties[application.property_id];
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() + 1, 1);
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1);

      await Lease.create({
        property_id: application.property_id,
        client_id: application.user_id, // Note: using user_id as client_id
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        monthly_rent: property.monthly_rent,
        deposit: property.monthly_rent,
        payment_day: 1,
        status: 'active'
      });
      alert("Application Approved! A draft lease has been created.");
    } else if (newStatus === 'denied') {
      alert("Application Denied.");
    }

    loadData();
    if(selectedApplication) setSelectedApplication(null);
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { class: 'status-pending', icon: Clock },
      approved: { class: 'status-approved', icon: CheckCircle },
      denied: { class: 'status-denied', icon: XCircle }
    };
    const c = config[status] || config.pending;
    const Icon = c.icon;
    return (
      <Badge className={`${c.class} border-0 flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    );
  };

  const getScoreMeter = (score) => {
    const percentage = (score / 10) * 100;
    const color = score > 7 ? 'var(--status-approved)' : score >= 4 ? 'var(--status-pending)' : 'var(--status-denied)';
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className="h-2 rounded-full" style={{ 
          width: `${percentage}%`,
          backgroundColor: color
        }}></div>
      </div>
    );
  };

  const ApplicationCard = ({ application }) => {
    const user = users[application.user_id];
    const property = properties[application.property_id];
    const daysPending = differenceInDays(new Date(), new Date(application.created_date));

    return (
      <Card className="hover-lift border-muted shadow-lg bg-card">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-lg text-primary">
                {user ? user.full_name : 'Unknown Applicant'}
              </h3>
              <p className="text-sm text-secondary">
                {property ? property.title : 'Unknown Property'}
              </p>
            </div>
            {getStatusBadge(application.status)}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center text-secondary">
              <Mail className="w-4 h-4 mr-2" />
              <span className="text-sm truncate">{user?.email}</span>
            </div>
            <div className="flex items-center text-secondary">
              <Phone className="w-4 h-4 mr-2" />
              <span className="text-sm">{user?.phone}</span>
            </div>
            <div className="flex items-center text-secondary">
              <DollarSign className="w-4 h-4 mr-2" />
              <span className="text-sm">${property?.monthly_rent?.toLocaleString()}</span>
            </div>
            <div className="flex items-center text-secondary">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="text-sm">{daysPending} days ago</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-secondary">Docs Complete:</span>
              <span className="text-sm font-medium text-primary">{Math.round((application.docs_complete || 0) * 100)}%</span>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-secondary">Score:</span>
                <span className="text-sm font-medium text-primary">{(application.score || 0).toFixed(1)}/10</span>
              </div>
              {getScoreMeter(application.score || 0)}
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedApplication(application)}
              className="flex-1 border-muted text-secondary hover:bg-muted focus-brand"
            >
              View Details
            </Button>
            {application.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  onClick={() => updateApplicationStatus(application, 'approved')}
                  className="text-white focus-brand"
                  style={{backgroundColor: 'var(--status-approved)'}}
                >
                  <CheckCircle className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateApplicationStatus(application, 'denied')}
                  className="border-status-denied text-status-denied hover:bg-red-50 focus-brand"
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const KanbanColumn = ({ status, applications }) => (
    <div className="flex-1 min-w-80">
      <div className="bg-slate-100 rounded-lg p-4 mb-4">
        <h3 className="font-semibold text-primary capitalize flex items-center gap-2">
          {status === 'pending' && <Clock className="w-4 h-4 text-yellow-600" />}
          {status === 'approved' && <CheckCircle className="w-4 h-4 text-green-600" />}
          {status === 'denied' && <XCircle className="w-4 h-4 text-red-600" />}
          {status} ({applications.length})
        </h3>
      </div>
      <div className="space-y-4 max-h-[600px] overflow-y-auto p-1">
        {applications.map(app => (
          <ApplicationCard key={app.id} application={app} />
        ))}
      </div>
    </div>
  );

  const ApplicationDetailModal = ({ application, onClose }) => {
    const user = users[application.user_id];
    const property = properties[application.property_id];

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto border-0 shadow-2xl">
          <CardHeader className="border-b border-slate-200 sticky top-0 bg-white z-10">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl font-bold text-primary">
                  Application Details
                </CardTitle>
                <p className="text-secondary">
                  {user ? user.full_name : 'Unknown Applicant'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(application.status)}
                <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Applicant & Property Info */}
              <div>
                <h3 className="text-lg font-semibold text-primary mb-4">Applicant & Property</h3>
                <div className="space-y-2 text-sm">
                    <p><strong>Applicant:</strong> {user?.full_name}</p>
                    <p><strong>Email:</strong> {user?.email}</p>
                    <p><strong>Phone:</strong> {user?.phone}</p>
                    <p className="pt-2"><strong>Property:</strong> {property?.title}</p>
                    <p><strong>Address:</strong> {property?.address}</p>
                    <p><strong>Rent:</strong> ${property?.monthly_rent?.toLocaleString()}</p>
                </div>
              </div>

              {/* Application Summary */}
              <div>
                <h3 className="text-lg font-semibold text-primary mb-4">Summary</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-slate-50 p-4 text-center">
                        <div className="text-2xl font-bold text-primary">{(application.score || 0).toFixed(1)}/10</div>
                        <div className="text-sm text-secondary">Score</div>
                        {getScoreMeter(application.score || 0)}
                    </Card>
                    <Card className="bg-slate-50 p-4 text-center">
                        <div className="text-2xl font-bold text-primary">{Math.round((application.docs_complete || 0) * 100)}%</div>
                        <div className="text-sm text-secondary">Docs Complete</div>
                    </Card>
                 </div>
              </div>
            </div>

            {/* Document Viewer */}
            <div>
              <h3 className="text-lg font-semibold text-primary mb-4">Documents</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                    <h4 className="font-medium mb-2">Pay Stubs</h4>
                    {application.pay_stubs_urls?.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                            <Download className="w-4 h-4"/> Pay Stub {i + 1}
                        </a>
                    ))}
                </div>
                <div className="p-3 border rounded-lg">
                    <h4 className="font-medium mb-2">Credit Report</h4>
                    <a href={application.credit_report_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                        <Download className="w-4 h-4"/> View Report
                    </a>
                </div>
                 <div className="p-3 border rounded-lg">
                    <h4 className="font-medium mb-2">Driver's License</h4>
                    <a href={application.dl_front_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                        <Download className="w-4 h-4"/> View Front
                    </a>
                     <a href={application.dl_back_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline mt-1">
                        <Download className="w-4 h-4"/> View Back
                    </a>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {application.status === 'pending' && (
              <div className="flex gap-3 pt-6 border-t border-slate-200">
                <Button
                  onClick={() => updateApplicationStatus(application, 'approved')}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Application
                </Button>
                <Button
                  onClick={() => updateApplicationStatus(application, 'denied')}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Deny Application
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const pendingApps = filteredApplications.filter(a => a.status === 'pending');
  const approvedApps = filteredApplications.filter(a => a.status === 'approved');
  const deniedApps = filteredApplications.filter(a => a.status === 'denied');

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Applications</h1>
          <p className="text-secondary mt-1">Review and manage rental applications</p>
        </div>

        <div className="flex gap-3">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
            size="sm"
            className={viewMode === 'list' ? 'btn-primary focus-brand' : 'border-muted text-secondary hover:bg-muted focus-brand'}
          >
            List View
          </Button>
          <Button
            variant={viewMode === 'kanban' ? 'default' : 'outline'}
            onClick={() => setViewMode('kanban')}
            size="sm"
            className={viewMode === 'kanban' ? 'btn-primary focus-brand' : 'border-muted text-secondary hover:bg-muted focus-brand'}
          >
            Kanban
          </Button>
        </div>
      </div>

      <Card className="border-muted shadow-md bg-card">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted" />
              <Input
                placeholder="Search applications..."
                className="pl-10 border-muted focus:border-brand-primary"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
            <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
              <SelectTrigger className="border-muted focus:border-brand-primary">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="denied">Denied</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Min Score"
              className="border-muted focus:border-brand-primary"
              value={filters.scoreMin}
              onChange={(e) => setFilters({...filters, scoreMin: e.target.value})}
            />
            <Input
              type="number"
              placeholder="Max Score"
              className="border-muted focus:border-brand-primary"
              value={filters.scoreMax}
              onChange={(e) => setFilters({...filters, scoreMax: e.target.value})}
            />
            <Input
              type="number"
              placeholder="Pending > X days"
              className="border-muted focus:border-brand-primary"
              value={filters.agingDays}
              onChange={(e) => setFilters({...filters, agingDays: e.target.value})}
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="text-center py-12 text-secondary">Loading applications...</div>
      ) : viewMode === 'kanban' ? (
        <div className="flex gap-6 overflow-x-auto pb-6">
          <KanbanColumn status="pending" applications={pendingApps} />
          <KanbanColumn status="approved" applications={approvedApps} />
          <KanbanColumn status="denied" applications={deniedApps} />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApplications.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <FileText className="w-16 h-16 mx-auto text-muted mb-6" />
              <h3 className="text-2xl font-semibold text-primary mb-4">No applications found</h3>
              <p className="text-secondary">Applications will appear here once clients start applying.</p>
            </div>
          ) : (
            filteredApplications.map((application) => (
              <ApplicationCard key={application.id} application={application} />
            ))
          )}
        </div>
      )}

      {selectedApplication && (
        <ApplicationDetailModal
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
        />
      )}
    </div>
  );
}