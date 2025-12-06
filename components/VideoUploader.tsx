import React, { useCallback, useState } from 'react';
import { UploadCloud, FileVideo, AlertCircle, X, Link as LinkIcon, ArrowLeft } from 'lucide-react';

interface VideoUploaderProps {
  onFileSelected: (file: File) => void;
  onUrlSelected: (url: string) => void;
  isLoading: boolean;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({ onFileSelected, onUrlSelected, isLoading }) => {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateAndSetFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith('video/')) {
      setError("אנא העלה קובץ וידאו בלבד (MP4, WebM, MOV)");
      return;
    }
    // Limit to approx 40MB for browser base64 handling stability in this demo
    if (file.size > 40 * 1024 * 1024) {
        setError("הקובץ גדול מדי. אנא נסה קובץ הקטן מ-40MB לדמו זה.");
        return;
    }
    setFileName(file.name);
    onFileSelected(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onFileSelected]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setFileName(null);
    setError(null);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setError(null);
    onUrlSelected(urlInput.trim());
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      {/* Tabs */}
      <div className="flex bg-slate-800/50 p-1 rounded-xl mb-4 w-fit mx-auto border border-slate-700">
        <button
          onClick={() => { setMode('upload'); setError(null); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'upload' 
              ? 'bg-slate-700 text-white shadow-sm' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          העלאת קובץ
        </button>
        <button
          onClick={() => { setMode('url'); setError(null); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            mode === 'url' 
              ? 'bg-slate-700 text-white shadow-sm' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LinkIcon size={14} />
          קישור URL / YouTube
        </button>
      </div>

      {mode === 'upload' ? (
        <div 
          className={`relative group rounded-2xl border-2 border-dashed transition-all duration-300 ease-in-out
            ${dragActive ? 'border-yellow-500 bg-slate-800/50 scale-[1.02]' : 'border-slate-700 bg-slate-800/20'} 
            ${isLoading ? 'opacity-50 pointer-events-none' : 'hover:border-slate-500'}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input 
            type="file" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
            onChange={handleChange}
            accept="video/*"
            disabled={isLoading}
          />
          
          <div className="p-10 flex flex-col items-center justify-center text-center">
            {fileName ? (
               <div className="flex flex-col items-center animate-fade-in">
                  <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-4 text-yellow-500">
                    <FileVideo size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{fileName}</h3>
                  <p className="text-slate-400 text-sm">הקובץ מוכן לניתוח</p>
                  <button 
                    onClick={(e) => {
                        e.preventDefault(); // Prevent input click
                        clearFile();
                    }}
                    className="mt-4 z-20 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-full text-xs text-white flex items-center gap-2 transition-colors"
                  >
                      <X size={14}/>
                      החלף קובץ
                  </button>
               </div>
            ) : (
              <>
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-colors ${dragActive ? 'bg-yellow-500/20 text-yellow-500' : 'bg-slate-700/50 text-slate-400'}`}>
                  <UploadCloud size={40} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">גרור סרטון לכאן</h3>
                <p className="text-slate-400 mb-6 max-w-xs">
                  או לחץ כדי לבחור קובץ מהמחשב
                  <br />
                  <span className="text-xs text-slate-500">(MP4, WebM - עד 40MB)</span>
                </p>
                <div className="px-6 py-2 bg-slate-700 text-slate-200 rounded-full text-sm font-medium group-hover:bg-slate-600 transition-colors">
                  בחירת קובץ
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-slate-800/20 border border-slate-700 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <LinkIcon size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">הדבק קישור לסרטון</h3>
            <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
              ניתן להדביק קישור ישיר לקובץ וידאו (MP4) או קישור ל-YouTube.
              <br/>
              <span className="text-xs text-yellow-500/80 mt-1 block">
                * עבור YouTube, הניתוח יתבצע על סמך מידע זמין ברשת.
              </span>
            </p>
            
            <form onSubmit={handleUrlSubmit} className="max-w-md mx-auto relative">
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 pl-12 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                disabled={isLoading}
              />
              <div className="absolute left-2 top-1/2 -translate-y-1/2">
                 <button 
                  type="submit"
                  disabled={!urlInput || isLoading}
                  className="p-1.5 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg disabled:opacity-50 disabled:hover:bg-yellow-600 transition-colors"
                 >
                   <ArrowLeft size={18} />
                 </button>
              </div>
            </form>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400 text-sm animate-pulse">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default VideoUploader;