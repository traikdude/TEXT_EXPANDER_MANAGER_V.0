import React, { useState, useMemo, useEffect } from 'react';
import { EXPANSIONS_DATA } from './constants';
import { SectionFilter, ShortcutData, ToastMessage } from './types';
import { 
  Search, 
  X, 
  Globe, 
  Hash, 
  Download, 
  Copy, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  ClipboardList
} from 'lucide-react';

// --- Components ---

const Toast: React.FC<{ toast: ToastMessage | null }> = ({ toast }) => {
  if (!toast) return null;
  
  const bg = toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600';
  
  return (
    <div className={`fixed bottom-8 right-8 ${bg} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce transition-all duration-300 z-50`}>
      {toast.type === 'success' && <Check className="w-5 h-5" />}
      <span className="font-medium">{toast.message}</span>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<SectionFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(100);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: EXPANSIONS_DATA.length,
      universal: EXPANSIONS_DATA.filter(i => i.s === 'all').length,
      spanish: EXPANSIONS_DATA.filter(i => i.s === 'spanish').length,
      english: EXPANSIONS_DATA.filter(i => i.s === 'english').length,
    };
  }, []);

  // Filter Data
  const filteredData = useMemo(() => {
    let data = EXPANSIONS_DATA;

    if (activeTab === 'universal') data = data.filter(i => i.s === 'all');
    else if (activeTab === 'spanish') data = data.filter(i => i.s === 'spanish');
    else if (activeTab === 'english') data = data.filter(i => i.s === 'english');

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      data = data.filter(i => 
        i.k.toLowerCase().includes(lower) || 
        i.e.toLowerCase().includes(lower)
      );
    }
    return data;
  }, [searchTerm, activeTab]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  // Actions
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const copyToClipboard = (text: string, id?: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Copied to clipboard!', 'success');
      if (id) {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 1500);
      }
    }).catch(() => {
      showToast('Failed to copy', 'error');
    });
  };

  const copyVisible = () => {
    if (filteredData.length === 0) return showToast('Nothing to copy', 'info');
    const text = filteredData.map(i => i.e).join('\n');
    copyToClipboard(text);
    showToast(`Copied ${filteredData.length} items!`, 'success');
  };

  const exportCSV = () => {
    let csv = 'Shortcut,Expansion,Language\n';
    filteredData.forEach(e => {
      const k = e.k.replace(/"/g, '""');
      const exp = e.e.replace(/"/g, '""').replace(/\n/g, ' ');
      csv += `"${k}","${exp}","${e.s}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'gboard_shortcuts.csv';
    link.click();
    showToast('CSV Exported Successfully');
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(filteredData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'gboard_shortcuts.json';
    link.click();
    showToast('JSON Exported Successfully');
  };

  // Highlighting
  const HighlightText = ({ text, highlight }: { text: string, highlight: string }) => {
    if (!highlight.trim()) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() 
            ? <span key={i} className="bg-yellow-100 text-yellow-800 rounded px-0.5 font-semibold">{part}</span> 
            : <span key={i}>{part}</span>
        )}
      </span>
    );
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-[1600px] mx-auto space-y-8 font-sans">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-500 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-4 mb-3">
          <span className="text-4xl">📱</span> 
          Erik's Text Expansion Manager 
          <span className="text-4xl">✨</span>
        </h1>
        <p className="text-blue-50 text-lg opacity-90 mb-8 font-light">
          🎯 Search, filter, and manage all {stats.total.toLocaleString()} Gboard text shortcuts!
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Expansions', count: stats.total, icon: '📊' },
            { label: 'Universal', count: stats.universal, icon: '🌐' },
            { label: 'Spanish', count: stats.spanish, icon: '🇪🇸' },
            { label: 'English', count: stats.english, icon: '🇺🇸' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-colors">
              <div className="text-3xl font-bold mb-1">{stat.count.toLocaleString()}</div>
              <div className="text-sm font-medium opacity-80 flex items-center gap-2">
                <span>{stat.icon}</span> {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        
        {/* Search */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 rounded-xl outline-none transition-all duration-200 text-gray-700 placeholder-gray-400 font-medium"
            placeholder="Search shortcuts or expansions... (e.g., 'A1', 'morning', 'hola')"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          
          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All', icon: Globe, count: stats.total },
              { id: 'universal', label: 'Universal', icon: Hash, count: stats.universal },
              { id: 'spanish', label: 'Spanish', icon: () => <span className="text-sm">🇪🇸</span>, count: stats.spanish },
              { id: 'english', label: 'English', icon: () => <span className="text-sm">🇺🇸</span>, count: stats.english },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SectionFilter)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 border ${
                  activeTab === tab.id 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Export Buttons */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <button onClick={exportCSV} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm active:scale-95 transform">
              <Download className="w-4 h-4" /> CSV
            </button>
            <button onClick={exportJSON} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium shadow-sm active:scale-95 transform">
              <Download className="w-4 h-4" /> JSON
            </button>
            <button onClick={copyVisible} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium shadow-sm active:scale-95 transform">
              <ClipboardList className="w-4 h-4" /> Copy Visible
            </button>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center text-sm font-medium text-gray-500">
          <span>Showing <span className="text-blue-600 font-bold">{filteredData.length}</span> results</span>
          <span className="hidden md:inline">Click any row to copy to clipboard</span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/80 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4 w-[15%]">Shortcut 🔑</th>
                <th className="px-6 py-4 w-[55%]">Expansion 📝</th>
                <th className="px-6 py-4 w-[15%]">Language 🌍</th>
                <th className="px-6 py-4 w-[15%] text-right">Action ⚡</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedData.length > 0 ? (
                paginatedData.map((item, idx) => {
                  const uniqueId = `${item.k}-${idx}`;
                  return (
                    <tr 
                      key={uniqueId}
                      onClick={() => copyToClipboard(item.e, uniqueId)}
                      className="group hover:bg-blue-50/50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 align-top">
                        <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 font-mono text-sm font-bold rounded border border-blue-100 group-hover:bg-white group-hover:shadow-sm transition-all">
                          <HighlightText text={item.k} highlight={searchTerm} />
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="text-gray-800 text-base leading-relaxed break-words font-sans max-w-2xl">
                          <HighlightText text={item.e} highlight={searchTerm} />
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          item.s === 'spanish' ? 'bg-red-50 text-red-700 border-red-100' :
                          item.s === 'english' ? 'bg-green-50 text-green-700 border-green-100' :
                          'bg-blue-50 text-blue-700 border-blue-100'
                        }`}>
                          {item.s === 'spanish' ? 'Spanish' : item.s === 'english' ? 'English' : 'Universal'}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top text-right">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(item.e, uniqueId);
                          }}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                            copiedId === uniqueId
                              ? 'bg-green-100 text-green-700'
                              : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:shadow-sm'
                          }`}
                        >
                          {copiedId === uniqueId ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          {copiedId === uniqueId ? 'Copied' : 'Copy'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <Search className="w-16 h-16 opacity-20" />
                      <p className="text-lg font-medium text-gray-500">No expansions found</p>
                      <p className="text-sm">Try adjusting your search or filter</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredData.length > itemsPerPage && (
          <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-center items-center gap-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:shadow-none transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-gray-600">
              Page <span className="text-gray-900">{currentPage}</span> of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:shadow-none transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <Toast toast={toast} />
    </div>
  );
}