import { useState, useEffect } from "react";
import { db } from "../firebase";
import { 
  collection, addDoc, serverTimestamp, 
  onSnapshot, query, orderBy, deleteDoc, doc, updateDoc 
} from "firebase/firestore"; 
import axios from "axios";
import { FaTrash, FaEdit, FaPlus, FaList } from 'react-icons/fa'; 

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
  if (url.includes("open.spotify.com") && !url.includes("/embed/")) {
    return url.replace("open.spotify.com/", "open.spotify.com/embed/");
  }
  return url;
};

const Dashboard = () => {
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
  const [activeTab, setActiveTab] = useState("publier"); // "publier" ou "gerer"
  const [editId, setEditId] = useState(null); // Pour savoir si on modifie

  const IMGBB_API_KEY = "68894e481bdf632dcab54ddc18a9bb01"; 

  // --- CHARGEMENT DES NEWS ---
  useEffect(() => {
    const q = query(collection(db, "news"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNewsList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // --- SUPPRIMER ---
  const handleDelete = async (id) => {
    if (window.confirm("🗑️ Supprimer définitivement cette publication ?")) {
      try {
        await deleteDoc(doc(db, "news", id));
      } catch (error) {
        console.error("Erreur suppression:", error);
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
    setActiveTab("publier"); // On bascule sur le formulaire
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

    // --- NETTOYAGE DES LIENS ICI ---
    const cleanVideo = formatYouTube(videoLink);
    const cleanAudio = formatAudio(spotifyLink);

    const newsData = {
      title,
      content,
      category,
      imageUrl: imageUrl || (editId ? "" : ""), // Gestion image
      videoLink: cleanVideo, // Lien transformé
      spotifyLink: cleanAudio, // Lien transformé
      updatedAt: serverTimestamp(),
    };

    // La suite de ton code (addDoc ou updateDoc)...
    if (editId) {
      await updateDoc(doc(db, "news", editId), newsData);
    } else {
      await addDoc(collection(db, "news"), { ...newsData, createdAt: serverTimestamp() });
    }

    alert("🎉 Terminé ! Liens convertis et news publiée.");
    // ... reset des champs
  } catch (error) {
    console.error(error);
  }
  setLoading(false);
};

  return (
    <div className="admin-container">
      {/* NAVIGATION INTERNE */}
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
              <label>Lien Spotify / Apple Music (Optionnel)</label>
              <input type="text" placeholder="http://..." value={spotifyLink} onChange={(e) => setSpotifyLink(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Lien Vidéo YouTube (Optionnel)</label>
              <input type="text" placeholder="https://www.youtube.com/..." value={videoLink} onChange={(e) => setVideoLink(e.target.value)} />
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
      
      {/* ZONE MÉDIA : PRIORITÉ VIDÉO > IMAGE */}
<div className="card-media-container">
  {news.videoLink ? (
    /* Si une vidéo existe, on l'affiche en priorité */
    <iframe 
      src={news.videoLink} 
      className="media-embed" 
      title="video player"
      allowFullScreen
      style={{ width: '100%', height: '300px', border: 'none' }}
    ></iframe>
  ) : news.imageUrl ? (
    /* Sinon, si une image existe, on l'affiche */
    <img 
      src={news.imageUrl} 
      alt="illustration news" 
      className="admin-news-img" 
      style={{ width: '100%', height: '300px', objectFit: 'cover' }}
    />
  ) : (
    /* Optionnel : Un petit bandeau design s'il n'y a rien du tout */
    <div style={{ height: '100px', background: 'linear-gradient(90deg, #1e293b, #334155)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.8rem' }}>
      Aucun média visuel
    </div>
  )}
</div>

      {/* 2. LECTEUR AUDIO (Sous la zone média image/vidéo) */}
      {news.spotifyLink && (
        <div className="audio-container" style={{ padding: '15px 20px', background: 'rgba(0,0,0,0.2)' }}>
          <iframe 
            src={news.spotifyLink} 
            width="100%" height="180" 
            frameBorder="0" 
            allowTransparency="true" 
            allow="encrypted-media"
            style={{ borderRadius: '8px' }}
          ></iframe>
        </div>
      )}

      {/* 3. INFOS TEXTE (Toujours en bas) */}
      <div className="card-body">
        <span style={{ color: '#3b82f6', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
          {news.category}
        </span>
        <h3 style={{ marginTop: '5px' }}>{news.title}</h3>
        <p style={{ marginTop: '10px' }}>{news.content.substring(0, 150)}...</p>
      </div>

      {/* 4. ACTIONS */}
      <div className="card-footer">
        <button onClick={() => startEdit(news)} className="btn-edit">
          <FaEdit /> Modifier
        </button>
        <button onClick={() => handleDelete(news.id)} className="btn-delete">
          <FaTrash /> Supprimer
        </button>
      </div>
    </div>
  ))}
</div>
      )}
    </div>
  );
};

export default Dashboard;