import {
  AlertTriangle,
  Download,
  FileText,
  Folder,
  Upload
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

interface VaultDoc {
  id: string;
  name: string;
  category: 'Identity' | 'Contract' | 'Academic' | 'Tax';
  uploadedOn: string;
  expiresOn: string | null;
  status: 'Active' | 'Expiring Soon' | 'Expired';
}

export const Documents: React.FC = () => {
  const { activeSubModule, setActiveSubModule, addAuditLog } = useApp();

  const [docs, setDocs] = useState<VaultDoc[]>([
    { id: "DOC001", name: "Aadhaar Card Copy.pdf", category: "Identity", uploadedOn: "2026-01-15", expiresOn: null, status: "Active" },
    { id: "DOC002", name: "PAN Card Copy.pdf", category: "Identity", uploadedOn: "2026-01-15", expiresOn: null, status: "Active" },
    { id: "DOC003", name: "Passport Scan.pdf", category: "Identity", uploadedOn: "2026-01-16", expiresOn: "2026-07-28", status: "Expiring Soon" },
    { id: "DOC004", name: "Offer Letter Signed.pdf", category: "Contract", uploadedOn: "2026-01-10", expiresOn: null, status: "Active" }
  ]);

  const [activeFolder, setActiveFolder] = useState<'All' | 'Identity' | 'Contract' | 'Academic' | 'Tax'>('All');
  const [docName, setDocName] = useState('');
  const [docCategory, setDocCategory] = useState<'Identity' | 'Contract' | 'Academic' | 'Tax'>('Identity');
  const [expiryDate, setExpiryDate] = useState('');

  const filteredDocs = docs.filter(d => activeFolder === 'All' || d.category === activeFolder);

  const handleUploadDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;

    let status: VaultDoc['status'] = 'Active';
    if (expiryDate) {
      const expDate = new Date(expiryDate);
      const diffTime = expDate.getTime() - new Date().getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 0) status = 'Expired';
      else if (diffDays < 30) status = 'Expiring Soon';
    }

    const newDoc: VaultDoc = {
      id: `DOC00${docs.length + 1}`,
      name: docName,
      category: docCategory,
      uploadedOn: new Date().toISOString().split('T')[0],
      expiresOn: expiryDate || null,
      status
    };

    setDocs(prev => [newDoc, ...prev]);
    addAuditLog("Uploaded Document", "Document Vault", `Uploaded new document: ${docName}`);
    alert(`Document "${docName}" successfully uploaded to the vault!`);
    setDocName('');
    setExpiryDate('');
    setActiveSubModule('vault');
  };

  return (
    <div className="space-y-6">
      
      {/* Sub-tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => setActiveSubModule('vault')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeSubModule === 'vault' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Secure Document Vault
        </button>
        <button 
          onClick={() => setActiveSubModule('upload')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeSubModule === 'upload' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Upload New Document
        </button>
      </div>

      {/* ======================================= */}
      {/* 1. SECURE DOCUMENT VAULT                 */}
      {/* ======================================= */}
      {activeSubModule === 'vault' && (
        <div className="space-y-6 animate-fade-in text-xs">
          
          {/* Expiration alert banner */}
          {docs.some(d => d.status === 'Expiring Soon') && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-250 dark:border-amber-900 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-800 dark:text-amber-300">Document Expiration Action Required</p>
                <p className="text-amber-700 dark:text-amber-400 mt-1">One or more identity cards (e.g. Passport scan) are set to expire within 30 days. Please upload updated versions.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar folders */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-2 lg:col-span-1 h-fit">
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-2 px-2">Folders / Vault Areas</span>
              {(['All', 'Identity', 'Contract', 'Academic', 'Tax'] as const).map((folder) => (
                <button
                  key={folder}
                  onClick={() => setActiveFolder(folder)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl font-semibold transition-colors ${
                    activeFolder === folder 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-950'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Folder className="h-4 w-4" />
                    {folder === 'All' ? 'All Documents' : folder}
                  </span>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded-full">
                    {folder === 'All' ? docs.length : docs.filter(d => d.category === folder).length}
                  </span>
                </button>
              ))}
            </div>

            {/* Document list */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-3">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">Document Directory List</h3>
              
              <div className="space-y-3">
                {filteredDocs.map((d) => (
                  <div key={d.id} className="p-3.5 border rounded-xl flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-primary shrink-0" />
                      <div>
                        <p className="font-bold text-slate-850 dark:text-white">{d.name}</p>
                        <p className="text-[10px] text-slate-400 mt-1">Uploaded: {d.uploadedOn} {d.expiresOn ? `• Expiry: ${d.expiresOn}` : ''}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        d.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {d.status}
                      </span>
                      <button 
                        onClick={() => alert("Downloading document file...")}
                        className="p-1.5 bg-white dark:bg-slate-900 border rounded-lg"
                      >
                        <Download className="h-4 w-4 text-slate-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* 2. UPLOAD NEW DOCUMENT                  */}
      {/* ======================================= */}
      {activeSubModule === 'upload' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in text-xs max-w-xl">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">Upload File to Vault</h3>
            <p className="text-slate-400 mt-1">Files uploaded here are encrypted and stored in the employee's secure profile folder.</p>
          </div>

          <form onSubmit={handleUploadDoc} className="space-y-4">
            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Document Label Name</label>
              <input 
                type="text" 
                value={docName} 
                onChange={(e) => setDocName(e.target.value)}
                placeholder="e.g. Master Degree Certificate.pdf" 
                required 
                className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-750 dark:text-slate-205"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Folder Vault Category</label>
                <select 
                  value={docCategory} 
                  onChange={(e) => setDocCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350 focus:outline-none"
                >
                  <option value="Identity">Identity</option>
                  <option value="Contract">Contract</option>
                  <option value="Academic">Academic</option>
                  <option value="Tax">Tax</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Expiration Date (Optional)</label>
                <input 
                  type="date" 
                  value={expiryDate} 
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350"
                />
              </div>
            </div>

            <div className="space-y-1 pt-2">
              <label className="text-slate-400 font-medium">Drop File Upload</label>
              <div className="border-2 border-dashed rounded-xl p-8 text-center bg-slate-50 dark:bg-slate-950 cursor-pointer">
                <Upload className="h-6 w-6 text-slate-450 mx-auto mb-2" />
                <span className="font-bold text-slate-800 dark:text-slate-200">Drag & drop files or click to browse</span>
              </div>
            </div>

            <button 
              type="submit" 
              className="px-4 py-2 bg-primary text-white rounded-xl font-bold hover:scale-105 transition-all shadow-md shadow-primary/10"
            >
              Upload Secure File
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
