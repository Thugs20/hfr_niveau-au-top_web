import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { 
  collection, addDoc, serverTimestamp, 
  onSnapshot, query, orderBy, deleteDoc, doc, updateDoc 
} from "firebase/firestore"; 
import axios from "axios";
import { FaTrash, FaEdit, FaPlus, FaList } from 'react-icons/fa'; 
import toast, { Toaster } from 'react-hot-toast'; // Import du Toast

// Transforme YouTube classique en Embed
const formatYouTube = (url) => {
  if (!url) return "";
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) 
    ? `https://www.youtube.com/embed/${match[2]}` 
    : url;
};

// Transforme Audiomack/Spotify classique en Embed
const formatAudio = (url) => {
  if (!url) return "";
  if (url.includes("audiomack.com") && !url.includes("/embed/")) {
    return url.replace("audiomack.com/", "audiomack.com/embed/");
  }
  if (url.includes("spotify.com") && !url.includes("/embed/")) {
    return url.replace("open.spotify.com/", "open.spotify.com/embed/");
  }
  return url;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [isAuth, setIsAuth] = useState(false);

  // --- ÉTATS DU FORMULAIRE ---
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Actu");
  const [spotifyLink, setSpotifyLink] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- ÉTATS INTERFACE ---
  const [newsList, setNewsList] = useState([]);
  const [activeTab, setActiveTab] = useState("publier");
  const [editId, setEditId] = useState(null);

  const IMGBB_API_KEY = "68894e481bdf632dcab54ddc18a9bb01"; 

  // --- SÉCURITÉ : VÉRIFICATION DE L'ACCÈS ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuth(true);
      } else {
        navigate("/hfr-access-secret"); 
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // --- CHARGEMENT DES NEWS ---
  useEffect(() => {
    if (!isAuth) return;
    const q = query(collection(db, "news"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNewsList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [isAuth]);

  // --- SUPPRIMER ---
  const handleDelete = async (id) => {
    if (window.confirm("🗑️ Supprimer définitivement cette publication ?")) {
      try {
        await deleteDoc(doc(db, "news", id));
        toast.success("Publication supprimée !"); // Toast Succès
      } catch (error) {
        console.error("Erreur suppression:", error);
        toast.error("Erreur lors de la suppression."); // Toast Erreur
      }
    }
  };

  // --- PRÉPARER LA MODIFICATION ---
  const startEdit = (news) => {
    setEditId(news.id);
    setTitle(news.title);
    setContent(news.content);
    setCategory(news.category);
    setSpotifyLink(news.spotifyLink || "");
    setVideoLink(news.videoLink || "");
    setActiveTab("publier");
    window.scrollTo(0, 0);
  };

  // --- SAUVEGARDER (AJOUT OU MODIF) ---
  const handleUploadAndSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = "";
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);
        const response = await axios.post(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, formData);
        imageUrl = response.data.data.url;
      }

      const cleanVideo = formatYouTube(videoLink);
      const cleanAudio = formatAudio(spotifyLink);

      const newsData = {
        title,
        content,
        category,
        videoLink: cleanVideo,
        spotifyLink: cleanAudio,
        updatedAt: serverTimestamp(),
      };
      
      if (imageUrl) newsData.imageUrl = imageUrl;

      if (editId) {
        await updateDoc(doc(db, "news", editId), newsData);
        toast.success("✅ Mise à jour réussie !"); // Toast Succès
      } else {
        await addDoc(collection(db, "news"), { ...newsData, createdAt: serverTimestamp() });
        toast.success("🎉 News publiée avec succès !"); // Toast Succès
      }

      setTitle(""); setContent(""); setImageFile(null);
      setSpotifyLink(""); setVideoLink(""); setEditId(null);
      setActiveTab("gerer");
    } catch (error) {
      console.error(error);
      toast.error("⚠️ Erreur lors de l'enregistrement."); // Toast Erreur
    }
    setLoading(false);
  };

  if (!isAuth) return null;

  return (
    <div className="admin-container">
      {/* Le Toaster est nécessaire pour afficher les toasts */}
      <Toaster position="top-right" reverseOrder={false} />

      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === "publier" ? "active" : ""}`} 
          onClick={() => { setActiveTab("publier"); setEditId(null); }}
        >
          <FaPlus /> {editId ? "Modifier la news" : "Nouvelle Publication"}
        </button>
        <button 
          className={`tab-btn ${activeTab === "gerer" ? "active" : ""}`} 
          onClick={() => setActiveTab("gerer")}
        >
          <FaList /> Gérer les posts ({newsList.length})
        </button>
      </div>

      {activeTab === "publier" ? (
        <section className="admin-form-section animate-fade">
          <form className="admin-form" onSubmit={handleUploadAndSave}>
            <div className="form-group">
              <label>Titre de la news *</label>
              <input type="text" placeholder="Ex: Nouveau clip disponible" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            
            <div className="form-group">
              <label>Catégorie *</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Actu">Actualité</option>
                <option value="Opportunité">Opportunité</option>
              </select>
            </div>

            <div className="form-group">
              <label>Contenu de l'annonce *</label>
              <textarea placeholder="Écris ton message ici..." value={content} onChange={(e) => setContent(e.target.value)} required></textarea>
            </div>

            <div className="form-group">
              <label>Lien Spotify / Audiomack / Apple (Optionnel)</label>
              <input type="text" placeholder="Colle le lien ici..." value={spotifyLink} onChange={(e) => setSpotifyLink(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Lien Vidéo YouTube (Optionnel)</label>
              <input type="text" placeholder="https://www.youtube.com/watch?v=..." value={videoLink} onChange={(e) => setVideoLink(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Illustration (Photo) {editId && "(Laisser vide pour garder l'ancienne)"}</label>
              <input type="file" onChange={(e) => setImageFile(e.target.files[0])} accept="image/*" />
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "🚀 Traitement..." : editId ? "Mettre à jour" : "Publier sur le site"}
            </button>
          </form>
        </section>
      ) : (
        <div className="admin-news-grid animate-fade">
          {newsList.map((news) => (
            <div key={news.id} className="admin-news-card-premium">
              <div className="card-media-container">
                {news.videoLink ? (
                  <iframe src={news.videoLink} className="media-embed" title="video" allowFullScreen style={{ width: '100%', height: '300px', border: 'none' }}></iframe>
                ) : news.imageUrl ? (
                  <img src={news.imageUrl} alt="illustration" className="admin-news-img" style={{ width: '100%', height: '300px', objectFit: 'cover' }} />
                ) : (
                  <div style={{ height: '100px', background: 'linear-gradient(90deg, #1e293b, #334155)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.8rem' }}>Aucun média visuel</div>
                )}
              </div>

              {news.spotifyLink && (
                <div className="audio-container" style={{ padding: '15px 20px', background: 'rgba(0,0,0,0.2)' }}>
                  <iframe src={news.spotifyLink} width="100%" height="180" frameBorder="0" allowTransparency="true" allow="encrypted-media" style={{ borderRadius: '8px' }}></iframe>
                </div>
              )}

              <div className="card-body">
                <span style={{ color: '#3b82f6', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase' }}>{news.category}</span>
                <h3 style={{ marginTop: '5px' }}>{news.title}</h3>
                <p style={{ marginTop: '10px' }}>{news.content.substring(0, 150)}...</p>
              </div>

              <div className="card-footer">
                <button onClick={() => startEdit(news)} className="btn-edit"><FaEdit /> Modifier</button>
                <button onClick={() => handleDelete(news.id)} className="btn-delete"><FaTrash /> Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;