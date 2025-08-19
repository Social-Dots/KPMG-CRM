
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Building2, 
  LayoutDashboard, 
  Users, 
  FileText,
  User,
  Home,
  FileCheck,
  Settings
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "Properties",
    url: createPageUrl("Properties"),
    icon: Building2,
  },
  {
    title: "Applications",
    url: createPageUrl("Applications"),
    icon: FileText,
  },
  {
    title: "Clients",
    url: createPageUrl("Clients"),
    icon: Users,
  },
  {
    title: "Leases",
    url: createPageUrl("Leases"),
    icon: FileCheck,
  }
];

const publicPages = [
  {
    title: "Public Portal",
    url: createPageUrl("PublicPortal"),
    icon: Home,
  }
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const isPublicPortal = currentPageName === "PublicPortal";

  return (
    <div className="min-h-screen bg-base">
      {/* Analytics Integration Points */}
      {/* 
        GA4: gtag('event', 'page_view', { page_title: currentPageName });
        Meta Pixel: fbq('track', 'PageView');
        LinkedIn: _linkedin_partner_id tracking
      */}
      
      <style>
        {`
          :root {
            /* Brand Colors - REMAX Rouge Kabani */
            --brand-primary: #0054A4;
            --brand-secondary: #E11B22;
            --brand-primary-hover: #003d7a;
            --brand-secondary-hover: #c51621;
            
            /* Background System */
            --bg-base: #f8f9fa;
            --bg-card: #ffffff;
            --bg-muted: #f1f3f4;
            
            /* Border System */
            --border-muted: #e5e7eb;
            --border-focus: var(--brand-primary);
            
            /* Text Colors */
            --text-primary: #1f2937;
            --text-secondary: #6b7280;
            --text-muted: #9ca3af;
            --text-white: #ffffff;
            
            /* Status Colors */
            --status-lead: #6b7280;
            --status-applied: var(--brand-primary);
            --status-pending: #f59e0b;
            --status-approved: #10b981;
            --status-denied: var(--brand-secondary);
          }
          
          /* Base Styles */
          .bg-base { background-color: var(--bg-base); }
          .bg-card { background-color: var(--bg-card); }
          .bg-muted { background-color: var(--bg-muted); }
          
          .text-primary { color: var(--text-primary); }
          .text-secondary { color: var(--text-secondary); }
          .text-muted { color: var(--text-muted); }
          
          .border-muted { border-color: var(--border-muted); }
          
          /* Brand Components */
          .btn-primary {
            background-color: var(--brand-primary);
            color: var(--text-white);
            border: none;
            transition: background-color 0.2s ease;
          }
          
          .btn-primary:hover {
            background-color: var(--brand-primary-hover);
          }
          
          .btn-secondary {
            background-color: var(--brand-secondary);
            color: var(--text-white);
            border: none;
            transition: background-color 0.2s ease;
          }
          
          .btn-secondary:hover {
            background-color: var(--brand-secondary-hover);
          }
          
          /* Status Badges */
          .status-lead { background-color: #f3f4f6; color: var(--status-lead); }
          .status-applied { background-color: #dbeafe; color: var(--status-applied); }
          .status-pending { background-color: #fef3c7; color: var(--status-pending); }
          .status-approved { background-color: #d1fae5; color: var(--status-approved); }
          .status-denied { background-color: #fee2e2; color: var(--status-denied); }
          
          /* Hover Effects */
          .hover-lift {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .hover-lift:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          }
          
          /* Focus States for Accessibility */
          .focus-brand:focus {
            outline: 2px solid var(--brand-primary);
            outline-offset: 2px;
          }
          
          /* Active States */
          .nav-active {
            border-bottom: 3px solid var(--brand-secondary);
            background-color: var(--bg-muted);
          }
        `}
      </style>

      {isPublicPortal ? (
        // Public Portal Layout (RE/MAX Branding)
        <div className="min-h-screen">
          <main className="flex-1">
            {children}
          </main>
        </div>
      ) : (
        // Internal KPMG Dashboard Layout
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <Sidebar className="border-r border-muted bg-card">
              <SidebarHeader className="border-b border-muted p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 btn-primary rounded-xl flex items-center justify-center shadow-lg">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-primary text-lg">KPMG</h2>
                    <p className="text-xs text-muted">Property Management</p>
                  </div>
                </div>
              </SidebarHeader>
              
              <SidebarContent className="p-3">
                <SidebarGroup>
                  <SidebarGroupLabel className="text-xs font-semibold text-muted uppercase tracking-wider px-3 py-2">
                    Management
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {navigationItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton 
                            asChild 
                            className={`hover:bg-muted text-secondary hover:text-primary transition-all duration-200 rounded-xl mb-1 focus-brand ${
                              location.pathname === item.url ? 'nav-active text-primary' : ''
                            }`}
                          >
                            <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                              <item.icon className="w-5 h-5" />
                              <span className="font-medium">{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                  <SidebarGroupLabel className="text-xs font-semibold text-muted uppercase tracking-wider px-3 py-2">
                    Public
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {publicPages.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton asChild className="hover:bg-muted text-secondary hover:text-primary transition-all duration-200 rounded-xl mb-1 focus-brand">
                            <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                              <item.icon className="w-5 h-5" />
                              <span className="font-medium">{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>

              <SidebarFooter className="border-t border-muted p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-primary text-sm truncate">Agent Portal</p>
                    <p className="text-xs text-muted truncate">KPMG System</p>
                  </div>
                </div>
              </SidebarFooter>
            </Sidebar>

            <main className="flex-1 flex flex-col">
              <header className="bg-card border-b border-muted px-6 py-4 md:hidden">
                <div className="flex items-center gap-4">
                  <SidebarTrigger className="hover:bg-muted p-2 rounded-lg transition-colors duration-200 focus-brand" />
                  <h1 className="text-xl font-bold text-primary">KPMG</h1>
                </div>
              </header>

              <div className="flex-1 overflow-auto">
                {children}
              </div>
            </main>
          </div>
        </SidebarProvider>
      )}
    </div>
  );
}
