import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const HomePage = () => {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  const createNewCanvas = async () => {
    if (creating) return;
    setCreating(true);
    try {
      const docRef = await addDoc(collection(db, 'canvases'), {
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        json: null, // Start with an empty canvas state
      });
      navigate(`/canvas/${docRef.id}`);
    } catch (err) {
      console.error('Failed to create canvas doc:', err);
      setCreating(false); // Reset button state on error
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 antialiased flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center">
        <header className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">Drawing Pad 🎨</h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
            A real-time collaborative whiteboard.
          </p>
        </header>

        <div className="flex gap-4">
          <button
            onClick={createNewCanvas}
            disabled={creating}
            className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? 'Creating...' : 'Create New Canvas'}
          </button>
        </div>
      </div>
    </main>
  );
};

export default HomePage;