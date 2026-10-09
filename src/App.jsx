import { useEffect } from 'react';
import { Routes, Route, useLocation, useSearchParams } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Home from './pages/Home.jsx';
import Results from './pages/Results.jsx';
import ListingDetail from './pages/ListingDetail.jsx';
import ListYourPG from './pages/ListYourPG.jsx';
import Compare from './pages/Compare.jsx';
import Roommates from './pages/Roommates.jsx';
import OwnerDashboard from './pages/OwnerDashboard.jsx';
import Marketplace from './pages/Marketplace.jsx';
import Auth from './pages/Auth.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Deep-link ?tab=price / ?tab=maintenance into the listing detail tabs
function ListingDetailWithTab() {
  const [params] = useSearchParams();
  const tab = params.get('tab');
  return <ListingDetail initialTab={tab} />;
}

export default function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pgs" element={<Results />} />
        <Route path="/pgs/:id" element={<ListingDetailWithTab />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/roommates" element={<Roommates />} />
        <Route path="/owner" element={<OwnerDashboard />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/list" element={<ListYourPG />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </AuthProvider>
  );
}
