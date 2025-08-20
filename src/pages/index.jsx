import Layout from "./Layout.jsx";
import Login from "./Login.jsx";

import Dashboard from "./Dashboard";

import Properties from "./Properties";

import ClientPortal from "./ClientPortal";

import ApplyForRental from "./ApplyForRental";

import Applications from "./Applications";

import Clients from "./Clients";

import PublicPortal from "./PublicPortal";

import Leases from "./Leases";

import ApplicationSuccess from "./ApplicationSuccess";

import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Properties: Properties,
    
    ClientPortal: ClientPortal,
    
    ApplyForRental: ApplyForRental,
    
    Applications: Applications,
    
    Clients: Clients,
    
    PublicPortal: PublicPortal,
    
    Leases: Leases,
    
    ApplicationSuccess: ApplicationSuccess,
    
    Login: Login,
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Protected route component
function ProtectedRoute({ children }) {
    const { isAuthenticated } = useAuth();
    const location = useLocation();
    
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    return children;
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Routes>            
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={
                <ProtectedRoute>
                    <Layout currentPageName="Dashboard">
                        <Dashboard />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/Dashboard" element={
                <ProtectedRoute>
                    <Layout currentPageName="Dashboard">
                        <Dashboard />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/Properties" element={
                <ProtectedRoute>
                    <Layout currentPageName="Properties">
                        <Properties />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/ClientPortal" element={
                <ProtectedRoute>
                    <Layout currentPageName="ClientPortal">
                        <ClientPortal />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/ApplyForRental" element={
                <ProtectedRoute>
                    <Layout currentPageName="ApplyForRental">
                        <ApplyForRental />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/Applications" element={
                <ProtectedRoute>
                    <Layout currentPageName="Applications">
                        <Applications />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/Clients" element={
                <ProtectedRoute>
                    <Layout currentPageName="Clients">
                        <Clients />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/PublicPortal" element={
                <ProtectedRoute>
                    <Layout currentPageName="PublicPortal">
                        <PublicPortal />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/Leases" element={
                <ProtectedRoute>
                    <Layout currentPageName="Leases">
                        <Leases />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/ApplicationSuccess" element={
                <ProtectedRoute>
                    <Layout currentPageName="ApplicationSuccess">
                        <ApplicationSuccess />
                    </Layout>
                </ProtectedRoute>
            } />
            
        </Routes>
    );
}

export default function Pages() {
    return (
        <AuthProvider>
            <Router>
                <PagesContent />
            </Router>
        </AuthProvider>
    );
}