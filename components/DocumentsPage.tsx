import React, { useState, useEffect } from 'react';
import { Document, User, Task, Form, DocumentStatus } from '../types';
import DocumentEditor from './DocumentEditor';
import { DocumentTextIcon, PlusIcon, ThreeDotsIcon } from './Icons';
import { toPersianDate } from '../utils/dateUtils';

// A colorful plus icon similar to Google Docs.
const ColorfulPlusIcon: React.FC = () => (
    <svg width="44" height="44" viewBox="0 0 44 44">
        <path d="M20 4H24V20H40V24H24V40H20V24H4V20H20V4Z" fill="url(#gplus-gradient)"/>
        <defs>
            <linearGradient id="gplus-grad-v" x1="0" y1="0" x2="0" y2="100%">
                <stop offset="0%" stopColor="#4285F4"/>
                <stop offset="100%" stopColor="#EA4335"/>
            </linearGradient>
            <linearGradient id="gplus-grad-h" x1="0" y1="0" x2="100%" y2="0">
                <stop offset="0%" stopColor="#FBBC04"/>
                <stop offset="100%" stopColor="#34A853"/>
            </linearGradient>
            <pattern id="gplus-gradient" width="44" height="44" patternUnits="userSpaceOnUse">
                <rect x="0" y="0" width="44" height="22" fill="#4285F4"/>
                <rect x="0" y="22" width="44" height="22" fill="#FBBC04"/>
                <rect x="0" y="20" width="22" height="4" fill="#EA4335"/>
                <rect x="22" y="20" width="22" height="4" fill="#34A853"/>
            </pattern>
        </defs>
    </svg>
);


const NewDocumentCard: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <div className="w-40">
        <button onClick={onClick} className="w-full border bg-white border-gray-200 rounded-lg hover:border-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400">
            <div className="h-52 flex items-center justify-center">
                <svg width="44" height="44" viewBox="0 0 44 44">
                    <path d="M20 4H24V20H40V24H24V40H20V24H4V20H20V4Z" fill="#DBEAFE"/>
                    <path d="M20 20H24V24H20z" fill="#1D4ED8"/>
                    <path fill="#4285F4" d="M20 4h4v16h-4z"/>
                    <path fill="#34A853" d="M24 20h16v4h-16z"/>
                    <path fill="#FBBC04" d="M20 24h4v16h-4z"/>
                    <path fill="#EA4335" d="M4 20h16v4h-16z"/>
                </svg>
            </div>
        </button>
        <p className="mt-2 text-sm font-medium text-brand-text">خالی</p>
    </div>
);

const DocumentCard: React.FC<{ document: Document, onClick: () => void }> = ({ document, onClick }) => {
    return (
        <div className="w-full group">
            <button onClick={onClick} className="w-full border border-gray-200 rounded-lg hover:border-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400">
                <div className="h-52 bg-white flex items-center justify-center p-4 rounded-t-lg overflow-hidden">
                    <DocumentTextIcon className="w-16 h-16 text-gray-300" />
                </div>
            </button>
            <div className="mt-2 px-1">
                <p className="text-sm font-medium text-brand-text truncate flex items-center">
                  <span className="text-base mr-1">{document.icon}</span>
                  {document.title}
                </p>
                <div className="flex items-center justify-between text-xs text-brand-subtext mt-1">
                    <span>اصلاح شده {toPersianDate(document.lastUpdatedAt)}</span>
                    <button className="p-1 rounded-full hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ThreeDotsIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};


interface DocumentsPageProps {
  documents: Document[];
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  users: User[];
  tasks: Task[];
  forms: Form[];
  documentStatuses: DocumentStatus[];
  onSelectTask: (taskId: string) => void;
  onOpenForm: (formId: string) => void;
  activeDocumentId: string | null;
  setActiveDocumentId: (id: string | null) => void;
}

const DocumentsPage: React.FC<DocumentsPageProps> = ({ documents, setDocuments, users, tasks, forms, documentStatuses, onSelectTask, onOpenForm, activeDocumentId, setActiveDocumentId }) => {

  const handleCreateNewDocument = () => {
    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      title: 'دستورالعمل بدون عنوان',
      icon: '📄',
      content: [{ id: `b-${Date.now()}`, type: 'paragraph', content: '' }],
      creatorId: 'u1', // Default creator, should be current user in a real app
      createdAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      statusId: documentStatuses[0]?.id || '',
    };
    setDocuments(prev => [newDoc, ...prev]);
    setActiveDocumentId(newDoc.id);
  };

  const handleUpdateDocument = (updatedDoc: Document) => {
    setDocuments(prev => prev.map(d => (d.id === updatedDoc.id ? updatedDoc : d)));
  };

  const activeDocument = documents.find(d => d.id === activeDocumentId);

  if (activeDocumentId && activeDocument) {
    return (
      <DocumentEditor
        key={activeDocument.id}
        document={activeDocument}
        onUpdate={handleUpdateDocument}
        users={users}
        tasks={tasks}
        forms={forms}
        documentStatuses={documentStatuses}
        onSelectTask={onSelectTask}
        onOpenForm={onOpenForm}
        isMobileView={true} // Re-using this to get the back button
        onBack={() => setActiveDocumentId(null)}
      />
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top section: Create new document */}
        <div className="p-4 sm:p-6 rounded-lg">
          <h2 className="text-base font-medium text-gray-700">شروع دستورالعمل جدید</h2>
          <div className="mt-4">
            <NewDocumentCard onClick={handleCreateNewDocument} />
          </div>
        </div>

        {/* Bottom section: Recent documents */}
        <div className="mt-8">
          <div className="flex justify-between items-center px-4 sm:px-6">
            <h2 className="text-base font-medium text-gray-800">دستورالعمل‌های تازه</h2>
            {/* Toolbar can be added here later */}
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-8">
            {documents.map(doc => (
              <DocumentCard key={doc.id} document={doc} onClick={() => setActiveDocumentId(doc.id)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;