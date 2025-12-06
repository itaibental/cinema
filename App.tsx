import React, { useState } from 'react';
import Header from './components/Header';
import VideoUploader from './components/VideoUploader';
import AnalysisResult from './components/AnalysisResult';
import { analyzeVideoContent, analyzeYoutubeVideo } from './services/gemini';
import { CinematicAnalysis, AnalysisStatus } from './types';
import { Loader2, Play } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [result, setResult] = useState<CinematicAnalysis | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileToGenerativePart = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result as string;
        // Remove the data URL prefix (e.g., "data:video/mp4;base64,")
        const base64Content = base64Data.split(',')[1];
        resolve(base64Content);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelected = (file: File) => {
    setVideoFile(file);
    setStatus(AnalysisStatus.IDLE);
    setResult(null);
    setErrorMessage(null);
  };

  const handleUrlSelected = async (url: string) => {
    setStatus(AnalysisStatus.PROCESSING);
    setResult(null);
    setVideoFile(null);
    setErrorMessage(null);

    // YouTube Handling
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      try {
        const data = await analyzeYoutubeVideo(url);
        setResult(data);
        setStatus(AnalysisStatus.COMPLETED);
      } catch (error) {
        console.error(error);
        setStatus(AnalysisStatus.ERROR);
        setErrorMessage("לא הצלחנו לנתח את סרטון ה-YouTube. ייתכן והמידע עליו אינו זמין בחיפוש.");
      }
      return;
    }

    // Direct MP4 File Handling
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
      
      const blob = await response.blob();
      if (!blob.type.startsWith('video/')) {
        throw new Error("הקישור אינו מוביל לקובץ וידאו תקין");
      }

      const file = new File([blob], "video_from_url.mp4", { type: blob.type });
      setVideoFile(file);
      
      // Auto-start analysis for URL
      const base64Data = await fileToGenerativePart(file);
      const data = await analyzeVideoContent(base64Data, file.type);
      setResult(data);
      setStatus(AnalysisStatus.COMPLETED);

    } catch (error) {
      console.error(error);
      setStatus(AnalysisStatus.ERROR);
      setErrorMessage("נכשל בטעינת הסרטון מהקישור. וודא שהקישור תקין, ישיר, ושהשרת מאפשר גישה (CORS).");
    }
  };

  const handleAnalyze = async () => {
    if (!videoFile) return;

    setStatus(AnalysisStatus.PROCESSING);
    setErrorMessage(null);
    try {
      const base64Data = await fileToGenerativePart(videoFile);
      const data = await analyzeVideoContent(base64Data, videoFile.type);
      setResult(data);
      setStatus(AnalysisStatus.COMPLETED);
    } catch (error) {
      console.error(error);
      setStatus(AnalysisStatus.ERROR);
      setErrorMessage("אירעה שגיאה בניתוח הסרטון. ייתכן שהקובץ גדול מדי או לא נתמך.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 px-4 py-8 flex flex-col items-center">
        
        {status === AnalysisStatus.IDLE && !result && (
          <div className="text-center max-w-2xl mx-auto mb-8 animate-in fade-in zoom-in duration-500">
             <h2 className="text-3xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
               גלה את סודות הבימוי
             </h2>
             <p className="text-slate-400 text-lg leading-relaxed">
               העלה קטע וידאו או הדבק קישור (כולל YouTube), וקבל ניתוח מעמיק של המבע הקולנועי:
               זוויות, תאורה, סאונד ועריכה - ישירות מהבינה המלאכותית.
             </p>
          </div>
        )}

        <VideoUploader 
          onFileSelected={handleFileSelected} 
          onUrlSelected={handleUrlSelected}
          isLoading={status === AnalysisStatus.PROCESSING} 
        />

        {videoFile && status === AnalysisStatus.IDLE && (
          <button
            onClick={handleAnalyze}
            className="mt-8 group relative inline-flex items-center justify-center px-8 py-3 font-bold text-white transition-all duration-200 bg-yellow-600 rounded-full hover:bg-yellow-500 hover:shadow-lg hover:shadow-yellow-500/30 hover:-translate-y-1 focus:outline-none ring-offset-2 focus:ring-2 ring-yellow-500"
          >
            <Play className="ml-2 w-5 h-5 fill-current" />
            נתח סרטון ({videoFile.name === "video_from_url.mp4" ? "מהקישור" : videoFile.name})
            <div className="absolute inset-0 rounded-full ring-2 ring-white/20 group-hover:ring-white/40 transition-all" />
          </button>
        )}

        {status === AnalysisStatus.PROCESSING && (
          <div className="mt-12 flex flex-col items-center">
             <div className="relative">
                <div className="absolute inset-0 bg-yellow-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
                <Loader2 size={48} className="text-yellow-500 animate-spin relative z-10" />
             </div>
             <p className="mt-4 text-slate-300 font-medium animate-pulse">מנתח את המבע הקולנועי...</p>
             <p className="text-slate-500 text-xs mt-2">ה-AI עובד, זה עשוי לקחת כמה רגעים</p>
          </div>
        )}

        {status === AnalysisStatus.ERROR && (
          <div className="mt-8 p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-200 text-center max-w-md animate-in slide-in-from-bottom-2">
            <p className="font-bold">שגיאה</p>
            <p className="text-sm mt-1 opacity-80">{errorMessage || "נסה שוב עם קובץ אחר."}</p>
            <button 
              onClick={() => setStatus(AnalysisStatus.IDLE)}
              className="mt-3 text-xs underline hover:text-white"
            >
              נסה שוב
            </button>
          </div>
        )}

        {status === AnalysisStatus.COMPLETED && result && (
           <AnalysisResult data={result} />
        )}

      </main>

      <footer className="py-6 text-center text-slate-600 text-xs border-t border-slate-900">
        <p>© {new Date().getFullYear()} CinemAI Demo. Created with Gemini API.</p>
      </footer>
    </div>
  );
};

export default App;