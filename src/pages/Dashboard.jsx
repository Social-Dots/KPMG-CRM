import React, { useState, useEffect } from "react";
import { Property } from "@/api/entities";
import { Client } from "@/api/entities";
import { RentalApplication } from "@/api/entities";
import { Lease } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Users, 
  FileText, 
  DollarSign,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Calendar
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

export default function Dashboard() {
  const [stats, setStats] = useState({
    occupancyRate: 0,
    availableUnits: 0,
    pendingApps: 0,
    approvedApps: 0,
    deniedApps: 0,
    monthlyRecurringRent: 0,
    rentGrowth: 0
  });
  const [agingApplications, setAgingApplications] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [properties, clients, applications, leases] = await Promise.all([
        Property.list('-created_date'),
        Client.list('-created_date'),
        RentalApplication.list('-created_date'),
        Lease.list('-created_date')
      ]);

      const totalUnits = properties.length;
      const leasedUnits = properties.filter(p => p.status === 'leased').length;
      const availableUnits = properties.filter(p => p.status === 'available').length;
      const occupancyRate = totalUnits > 0 ? ((leasedUnits / totalUnits) * 100).toFixed(1) : 0;

      const pendingApps = applications.filter(a => a.status === 'pending').length;
      const approvedApps = applications.filter(a => a.status === 'approved').length;
      const deniedApps = applications.filter(a => a.status === 'denied').length;

      const activeLeases = leases.filter(l => l.status === 'active');
      const monthlyRecurringRent = activeLeases.reduce((sum, l) => sum + (l.monthly_rent || 0), 0);

      // Find aging applications (>48h)
      const twoDaysAgo = new Date();
      twoDaysAgo.setHours(twoDaysAgo.getHours() - 48);
      const aging = applications.filter(app => 
        app.status === 'pending' && new Date(app.created_date) < twoDaysAgo
      ).slice(0, 5);

      setStats({
        occupancyRate,
        availableUnits,
        pendingApps,
        approvedApps,
        deniedApps,
        monthlyRecurringRent,
        rentGrowth: 8.5 // Placeholder
      });

      setAgingApplications(aging);
      
      // Recent activity (last 10 items)
      const activity = [
        ...properties.slice(0, 3).map(p => ({
          type: 'property',
          title: `Property "${p.title}" created`,
          timestamp: p.created_date
        })),
        ...applications.slice(0, 4).map(a => ({
          type: 'application',
          title: `Application ${a.status} for property`,
          timestamp: a.created_date
        })),
        ...leases.slice(0, 3).map(l => ({
          type: 'lease',
          title: `Lease created`,
          timestamp: l.created_date
        }))
      ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

      setRecentActivity(activity);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickApproval = async (applicationId, decision) => {
    await RentalApplication.update(applicationId, { 
      status: decision,
      decision_at: new Date().toISOString()
    });
    loadDashboardData();
  };

  const StatCard = ({ title, value, icon: Icon, color = "blue", trend }) => (
    <Card className="border-muted shadow-lg bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-secondary">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${color === 'blue' ? 'bg-blue-50' : color === 'green' ? 'bg-green-50' : color === 'purple' ? 'bg-purple-50' : 'bg-yellow-50'}`}>
          <Icon className={`h-4 w-4 ${color === 'blue' ? 'text-brand-primary' : color === 'green' ? 'text-status-approved' : color === 'purple' ? 'text-brand-secondary' : 'text-status-pending'}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-primary">{value}</div>
        {trend && (
          <div className="flex items-center text-xs text-secondary mt-1">
            <TrendingUp className="w-3 h-3 mr-1 text-status-approved" />
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
          <p className="text-secondary mt-1">Property management overview</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Link to={createPageUrl("Properties")}>
            <Button variant="outline" size="sm" className="border-muted text-secondary hover:bg-muted focus-brand">
              <Plus className="w-4 h-4 mr-2" />
              Add Property
            </Button>
          </Link>
          <Link to={createPageUrl("Clients")}>
            <Button variant="outline" size="sm" className="border-muted text-secondary hover:bg-muted focus-brand">
              <Plus className="w-4 h-4 mr-2" />
              New Client
            </Button>
          </Link>
          <Link to={createPageUrl("Applications")}>
            <Button variant="outline" size="sm" className="border-muted text-secondary hover:bg-muted focus-brand">
              <Plus className="w-4 h-4 mr-2" />
              New Application
            </Button>
          </Link>
          <Link to={createPageUrl("Leases")}>
            <Button className="btn-primary focus-brand" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Record Lease
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Occupancy Rate"
          value={`${stats.occupancyRate}%`}
          icon={Building2}
          color="blue"
          trend="+2.1% from last month"
        />
        <StatCard
          title="Available Units"
          value={stats.availableUnits}
          icon={Building2}
          color="green"
        />
        <StatCard
          title="Applications"
          value={`${stats.pendingApps}/${stats.approvedApps}/${stats.deniedApps}`}
          icon={FileText}
          color="purple"
          trend="Pending/Approved/Denied"
        />
        <StatCard
          title="Monthly Recurring Rent"
          value={`$${stats.monthlyRecurringRent.toLocaleString()}`}
          icon={DollarSign}
          color="yellow"
          trend={`+${stats.rentGrowth}% MoM`}
        />
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Aging Applications */}
        <div className="lg:col-span-2">
          <Card className="border-muted shadow-lg bg-card">
            <CardHeader className="border-b border-muted">
              <CardTitle className="flex items-center gap-2 text-primary">
                <Clock className="w-5 h-5 text-status-pending" />
                Aging Applications ({'>'}48h)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border-muted">
                {agingApplications.length === 0 ? (
                  <div className="p-6 text-center text-secondary">No aging applications</div>
                ) : (
                  agingApplications.map((app) => (
                    <div key={app.id} className="p-4 hover:bg-muted">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-primary">Application #{app.id.slice(-6)}</h4>
                          <p className="text-sm text-secondary">
                            Applied {format(new Date(app.created_date), 'MMM d, yyyy')}
                          </p>
                          <p className="text-sm text-secondary">
                            Score: {app.score}/10
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleQuickApproval(app.id, 'approved')}
                            className="btn-approved text-white focus-brand"
                            style={{backgroundColor: 'var(--status-approved)'}}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickApproval(app.id, 'denied')}
                            className="border-status-denied text-status-denied hover:bg-red-50 focus-brand"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Deny
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card className="border-muted shadow-lg bg-card">
            <CardHeader className="border-b border-muted">
              <CardTitle className="flex items-center gap-2 text-primary">
                <Calendar className="w-5 h-5 text-brand-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {recentActivity.length === 0 ? (
                <div className="text-center text-secondary py-4">No recent activity</div>
              ) : (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'property' ? 'bg-brand-primary' :
                      activity.type === 'application' ? 'bg-brand-secondary' :
                      'bg-status-approved'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-primary">{activity.title}</p>
                      <p className="text-xs text-secondary">
                        {format(new Date(activity.timestamp), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}