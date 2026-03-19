import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/hfr-access-secret"); // Redirection vers le login secret
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };

  return (
    <div className="admin-wrapper">
      <nav className="admin-navbar">
        <div className="admin-logo">
          HFR <span>STUDIO</span>
        </div>
        <div className="admin-nav-links">
          {/* On pourra ajouter d'autres liens ici plus tard si besoin */}
          <Link to="/dashboard-admin-hfr">Dashboard</Link>
          <button onClick={handleLogout} className="btn-logout">
            Déconnecter
          </button>
        </div>
      </nav>
      
      <main className="admin-content">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;