import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import AdminLayout from './components/AdminLayout'; // Nouveau Layout Admin
import Home from './pages/Home';
import News from './pages/News';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import './App.css';

// Ce composant va décider d'afficher ou non la Navbar ou l'AdminLayout
const Layout = ({ children }) => {
  const location = useLocation();
  
  // On liste ici toutes les routes de l'ESPACE ADMIN (Login + Dashboard)
  const isAdminPath = location.pathname.startsWith("/hfr-access-secret") || 
                      location.pathname.startsWith("/dashboard-admin-hfr");
                      location.pathname === "/login"; // Ajoute ceci par sécurité

  // Si c'est une route Admin
  if (isAdminPath) {
    // Si c'est la page de LOGIN, on ne met pas de Navbar du tout (total incognito)
    if (location.pathname === "/hfr-access-secret" || location.pathname === "/login") {
  return children;
  }
    // Si c'est le DASHBOARD, on met le LAYOUT ADMIN spécifique
    return <AdminLayout>{children}</AdminLayout>;
  }

  // Sinon, c'est une route Publique, on met la Navbar classique
  return (
    <>
      <Navbar /> 
      <div className="app-container">
        {children}
      </div>
    </>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Routes Publiques */}
          <Route path="/" element={<Home />} />
          <Route path="/news" element={<News />} />
          
          {/* Routes Admin (Complètement à part) */}
          <Route path="/hfr-access-secret" element={<Login />} />
          <Route path="/dashboard-admin-hfr" element={<Dashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;