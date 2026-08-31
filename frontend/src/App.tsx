import React, { useState, useEffect } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { VellumEditor } from './components/editor/VellumEditor';

function App() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeDocument, setActiveDocument] = useState<Document | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'editor'>('list');
  const [loading, setLoading] = useState<boolean>(true);

  const API_URL = 'http://localhost:3001/api/pages';

  const fetchDocuments = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      if (Array.isArray(data)) {
        setDocuments(data);
      } else {
        console.error("Received non-array data:", data);
        setDocuments([]);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const addDocument = async () => {
    try {
      // Wysyłamy pusty tytuł, aby nowy dokument był bez tematu
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '', content: '' })
      });
      const newDoc = await response.json();
      setDocuments((prev) => [newDoc, ...prev]);
      setActiveDocument(newDoc);
      setViewMode('editor');
    } catch (error) {
      console.error("Error adding document:", error);
    }
  };

  const selectDocument = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/${id}`);
      const doc = await response.json();
      setActiveDocument(doc);
      setViewMode('editor');
    } catch (error) {
      console.error("Error selecting document:", error);
    }
  };

  const updateDocument = async (updatedData: { title: string; content: string }) => {
    if (!activeDocument) return;
    try {
      const response = await fetch(`${API_URL}/${activeDocument.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) throw new Error('Failed to update');
      
      const updatedDoc = await response.json();
      setDocuments((prev) => prev.map((d) => (d.id === updatedDoc.id ? updatedDoc : d)));
      setActiveDocument(updatedDoc);
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };

  const deleteDocument = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Czy na pewno chcesz usunąć ten dokument?")) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete');
      
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      if (activeDocument?.id === id) {
        setActiveDocument(null);
        setViewMode('list');
      }
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const showAllPages = () => {
    setViewMode('list');
    setActiveDocument(null);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  if (loading) return <div className="p-10">Ładowanie...</div>;

  return (
    <MainLayout 
      onAddDocument={addDocument} 
      onSelectDocument={selectDocument}
      onShowAll={showAllPages}
    >
      {viewMode === 'list' ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Twoje Dokumenty</h2>
          {documents.length === 0 ? (
            <p className="text-slate-500">Brak dokumentów. Kliknij +, aby stworzyć pierwszy!</p>
          ) : (
            <div className="grid gap-2">
              {documents.map((doc) => (
                <div 
                  key={doc.id}
                  onClick={() => selectDocument(doc.id)}
                  className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md cursor-pointer transition-all group relative"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-slate-900">{doc.title || "Bez tytułu"}</h3>
                    <button 
                      onClick={(e) => deleteDocument(doc.id, e)}
                      className="p-2 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Usuń dokument"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        activeDocument ? (
          <VellumEditor 
            initialTitle={activeDocument.title}
            initialContent={activeDocument.content}
            onUpdate={updateDocument}
          />
        ) : (
          <div className="p-10 text-slate-500">Wybierz dokument, aby zacząć edycję.</div>
        )
      )}
    </MainLayout>
  );
}

declare interface Document {
  id: string;
  title: string;
  content: string;
}

export default App;
