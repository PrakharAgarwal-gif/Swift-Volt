"use client";

import { useState } from 'react';
import { FileText, Download, Folder, File, ChevronRight, Share2, Search } from 'lucide-react';

const CATEGORIES = [
  { id: 'invoices', name: 'GST Invoices', count: 12 },
  { id: 'quotations', name: 'Quotations', count: 5 },
  { id: 'brochures', name: 'Product Brochures', count: 14 },
  { id: 'warranty', name: 'Warranty Certificates', count: 28 },
  { id: 'dispatch', name: 'Dispatch Documents', count: 8 },
];

const MOCK_DOCUMENTS: Record<string, any[]> = {
  invoices: [
    { id: 'INV-2026-001', name: 'Invoice #INV-2026-001', date: '2026-07-01', size: '2.4 MB' },
    { id: 'INV-2026-002', name: 'Invoice #INV-2026-002', date: '2026-06-15', size: '1.8 MB' },
  ],
  quotations: [
    { id: 'QT-001', name: 'Q3 Bulk Order Quote', date: '2026-06-20', size: '850 KB' },
  ],
  brochures: [
    { id: 'BR-001', name: 'Swift Volt X-Pro Brochure 2026', date: '2026-01-10', size: '15.2 MB' },
    { id: 'BR-002', name: 'Commercial Loaders Spec Sheet', date: '2026-02-15', size: '5.1 MB' },
    { id: 'BR-003', name: 'Handicapped Model Guide', date: '2026-03-01', size: '3.4 MB' },
  ],
  warranty: [
    { id: 'WR-001', name: 'Warranty Policy 2026', date: '2026-01-01', size: '1.2 MB' },
    { id: 'WR-002', name: 'Battery Coverage Details', date: '2026-01-01', size: '800 KB' },
  ],
  dispatch: [
    { id: 'LR-8821', name: 'LR Receipt #8821', date: '2026-07-02', size: '1.1 MB' },
  ]
};

export default function DocumentCenterPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const documents = activeCategory ? MOCK_DOCUMENTS[activeCategory] || [] : [];
  
  const filteredDocs = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    doc.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownload = (doc: any) => {
    // In a real app, this would trigger a file download from S3/API
    alert(`Downloading ${doc.name}...`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Document Center</h1>
        <p className="text-gray-500">Secure access to all your dealership files and brochures.</p>
      </div>

      {!activeCategory ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.map(category => (
            <div 
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className="bg-white dark:bg-[#0f172a] p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg text-primary group-hover:scale-110 transition-transform">
                  <Folder className="h-6 w-6 fill-current opacity-20" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.count} files</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <button onClick={() => setActiveCategory(null)} className="hover:text-primary transition-colors">Folders</button>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-gray-900 dark:text-gray-300">
              {CATEGORIES.find(c => c.id === activeCategory)?.name}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search documents..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            {filteredDocs.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No documents found.</div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredDocs.map(doc => (
                  <li key={doc.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center justify-between group">
                    <div className="flex items-center space-x-4 overflow-hidden">
                      <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded text-red-500 shrink-0">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white truncate">{doc.name}</h4>
                        <p className="text-xs text-gray-500">{doc.date} • {doc.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0 ml-4">
                      <button 
                        onClick={() => handleDownload(doc)}
                        className="p-2 text-gray-400 hover:text-primary bg-gray-50 dark:bg-gray-800 hover:bg-primary/10 rounded-lg transition-colors"
                        title="Download PDF"
                      >
                        <Download className="h-5 w-5" />
                      </button>
                      <button 
                        className="p-2 text-gray-400 hover:text-primary bg-gray-50 dark:bg-gray-800 hover:bg-primary/10 rounded-lg transition-colors"
                        title="Share"
                      >
                        <Share2 className="h-5 w-5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
