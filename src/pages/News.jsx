import { useEffect, useState } from 'react';
import { db } from "../firebase"; // Les deux points pour sortir du dossier 'pages'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { motion } from 'framer-motion';

const News = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="news-page">
      <h1 className="glitch-title">Actualités & Opportunités</h1>
      <div className="news-grid">
        {posts.map((post) => (
          <motion.article 
            key={post.id} 
            className="news-card"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          >
            <h2>{post.title}</h2>
            <p>{post.content}</p>
            <span className="date">Posté le {post.createdAt?.toDate().toLocaleDateString()}</span>
          </motion.article>
        ))}
      </div>
    </div>
  );
};

export default News;