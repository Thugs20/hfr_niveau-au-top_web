import { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import des icônes

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // État pour l'œil
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard-admin-hfr"); // Redirection après succès
    } catch (err) {
      setError("Accès refusé. Identifiants incorrects.");
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
  <h2 className="logo">HFR <span>ADMIN</span></h2>
  <p>Espace réservé à l'artiste</p>
  
  {error && <p className="error-msg">{error}</p>}
  
  {/* CHAMP EMAIL */}
  <input 
    type="email" 
    placeholder="Email de l'artiste" 
    onChange={(e) => setEmail(e.target.value)} 
    required 
    style={{ 
      width: '100%', 
      padding: '15px', 
      marginBottom: '20px', 
      boxSizing: 'border-box',
      display: 'block',
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      color: 'white',
      borderRadius: '6px'
    }} 
  />
  
  {/* CHAMP MOT DE PASSE */}
  <div style={{ position: 'relative', width: '100%', marginBottom: '20px' }}>
    <input 
      type={showPassword ? "text" : "password"} 
      placeholder="Mot de passe" 
      onChange={(e) => setPassword(e.target.value)} 
      required 
      style={{ 
        width: '100%', 
        padding: '15px', 
        paddingRight: '45px', // Espace pour l'œil
        margin: '0', 
        boxSizing: 'border-box', 
        display: 'block',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: 'white',
        borderRadius: '6px'
      }} 
    />
    <button 
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      style={{
        position: 'absolute',
        right: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        color: '#94a3b8',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        width: 'auto'
      }}
    >
      {showPassword ? <FaEyeSlash /> : <FaEye />}
    </button>
  </div>
  
  <button type="submit">Se connecter</button>
</form>
    </div>
  );
};

export default Login;