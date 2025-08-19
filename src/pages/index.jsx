import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Properties from "./Properties";

import ClientPortal from "./ClientPortal";

import ApplyForRental from "./ApplyForRental";

import Applications from "./Applications";

import Clients from "./Clients";

import PublicPortal from "./PublicPortal";

import Leases from "./Leases";

import ApplicationSuccess from "./ApplicationSuccess";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

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

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Properties" element={<Properties />} />
                
                <Route path="/ClientPortal" element={<ClientPortal />} />
                
                <Route path="/ApplyForRental" element={<ApplyForRental />} />
                
                <Route path="/Applications" element={<Applications />} />
                
                <Route path="/Clients" element={<Clients />} />
                
                <Route path="/PublicPortal" element={<PublicPortal />} />
                
                <Route path="/Leases" element={<Leases />} />
                
                <Route path="/ApplicationSuccess" element={<ApplicationSuccess />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}