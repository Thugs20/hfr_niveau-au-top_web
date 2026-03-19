import { Link } from 'react-router-dom';
import { useState } from 'react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="main-nav">
      <Link to="/" className="logo">HFR_NVT</Link>

      {/* Bouton Burger pour Mobile */}
      <div className="burger" onClick={() => setIsOpen(!isOpen)}>
        <div className={isOpen ? "line open" : "line"}></div>
        <div className={isOpen ? "line open" : "line"}></div>
        <div className={isOpen ? "line open" : "line"}></div>
      </div>

      {/* Liens de navigation */}
      <div className={isOpen ? "nav-links open" : "nav-links"}>
        <Link to="/" onClick={() => setIsOpen(false)}>Accueil</Link>
        <Link to="/musique" onClick={() => setIsOpen(false)}>Musique</Link>
        <Link to="/concerts" onClick={() => setIsOpen(false)}>Concerts</Link>
        <Link to="/news" onClick={() => setIsOpen(false)}>Actu</Link>
        <Link to="/galerie" onClick={() => setIsOpen(false)}>Galerie</Link>
        <Link to="/bio" onClick={() => setIsOpen(false)}>Biographie</Link>
        <Link to="/contact" className="admin-link" onClick={() => setIsOpen(false)}>Contact</Link>
      </div>
    </nav>
  );
};

export default Navbar;