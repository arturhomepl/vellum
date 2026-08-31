import React from 'react';

interface MainLayoutProps {
  children: React.ReactNode;
  onAddDocument: () => void;
  onSelectDocument: (id: string) => void;
  onShowAll: () => void;
  documents: any[];
}

const DocumentTreeItem = ({ doc, onSelect, level = 0 }: { doc: any, onSelect: (id: string) => void, level?: number }) => (
  <div className="select-none">
    <div 
      onClick={() => onSelect(doc.id)}
      className="flex items-center py-1 px-2 hover:bg-slate-200 rounded cursor-pointer transition-colors"
      style={{ paddingLeft: `${level * 12 + 8}px` }}
    >
      {doc.children && doc.children.length > 0 && (
        <span className="mr-1 text-[10px] text-slate-400">▾</span>
      )}
      <span className="text-sm truncate">{doc.title || 'Bez tytułu'}</span>
    </div>
    {doc.children && doc.children.length > 0 && (
      <div className="ml-2 border-l border-slate-200">
        {doc.children.map((child: any) => (
          <DocumentTreeItem key={child.id} doc={child} onSelect={onSelect} level={level + 1} />
        ))}
      </div>
    )}
  </div>
);

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  onAddDocument, 
  onSelectDocument, 
  onShowAll,
  documents
}) => {
  return (
    <div className="flex h-screen w-full bg-[#fcfcfc] text-slate-800 overflow-hidden font-sans">
      {/* Lewy Panel (Sidebar) */}
      <aside className="w-64 flex-shrink-0 border-r border-[#e5e5e5] bg-[#f3f3f0] flex flex-col relative">
        <div className="p-6">
          <h1 className="text-xl font-bold text-slate-90_0">Vellum</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <button 
            onClick={onShowAll}
            className="w-full text-left px-3 py-2 text-sm font-medium rounded-md bg-white shadow-sm cursor-pointer transition-colors hover:bg-slate-50 mb-4"
          >
            All Pages
          </button>

          <div className="space-y-1">
            {documents && documents.map((doc) => (
              <DocumentTreeItem key={doc.id} doc={doc} onSelect={onSelectDocument} />
            ))}
          </div>
        </nav>
        
        <button 
          className="absolute bottom-6 right-6 w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition-all text-2xl font-light"
          aria-label="Add new page"
          onClick={onAddDocument}
        >
          +
        </button>
      </aside>
      
      {/* Główny Obszar Roboczy */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-12 flex-shrink-0 border-b border-[#e5e5_5] bg-white px-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="hover:text-slate-800 cursor-pointer">Workspace</span>
            <span className="text-slate-300">/</span>
            <span className="font-medium text-slate-800">Untitled Page</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-xs font-medium px-3 py-1 text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
              Share
            </button>
            <button className="text-xs font-medium px-3 py-1 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors">
              Save
            </button>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto bg-white relative">
          <div className="max-w-full py-12 px-8 min-h-full">
            {children}
          </div>
        </main>
      </div>
      
      <aside className="w-80 flex-shrink-0 border-l border-[#e5e5e5] bg-[#f3f3f0] p-6 hidden xl:block">
        <h2 className="text-xs font-semibold text-slate-400 uppercase mb-6">Properties</h2>
        <div className="text-xs text-slate-500">No properties set.</div>
      </aside>
    </div>
  );
};

export default MainLayout;