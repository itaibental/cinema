import React from 'react';
import { CinematicAnalysis, CinematicElement } from '../types';
import { Camera, Aperture, Music, Scissors, Lightbulb, Video, Globe } from 'lucide-react';

interface AnalysisResultProps {
  data: CinematicAnalysis;
}

const SectionTitle: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
  <div className="flex items-center gap-3 mb-4 text-yellow-500">
    {icon}
    <h3 className="text-xl font-bold">{title}</h3>
  </div>
);

const ElementCard: React.FC<{ item: CinematicElement }> = ({ item }) => (
  <div className="bg-slate-800/50 border border-slate-700/50 p-3 rounded-lg hover:border-yellow-500/30 transition-colors">
    <div className="flex justify-between items-start mb-1">
      <span className="font-bold text-slate-200 text-sm">{item.title}</span>
      {item.timecode && <span className="text-xs bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded font-mono">{item.timecode}</span>}
    </div>
    <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
  </div>
);

const AnalysisResult: React.FC<AnalysisResultProps> = ({ data }) => {
  return (
    <div className="w-full max-w-4xl mx-auto mt-10 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
      
      {/* Synopsis & Verdict */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-6 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-black text-white mb-2">תקציר וגזר דין</h2>
        <p className="text-slate-300 mb-4 text-lg leading-relaxed">{data.synopsis}</p>
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
          <h4 className="font-bold text-yellow-500 mb-1 flex items-center gap-2">
            <Lightbulb size={18} />
            סיכום המבע
          </h4>
          <p className="text-slate-200 italic">"{data.verdict}"</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Visual Style: Shots & Angles */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <SectionTitle icon={<Camera />} title="צילום וקומפוזיציה" />
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">סוגי שוטים</h4>
              <div className="grid gap-2">
                {data.visual_style.shot_types.map((shot, i) => <ElementCard key={i} item={shot} />)}
              </div>
            </div>
            
            <div className="pt-2">
              <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">זוויות ותנועה</h4>
              <div className="grid gap-2">
                {[...data.visual_style.camera_angles, ...data.visual_style.camera_movement].map((item, i) => (
                  <ElementCard key={i} item={item} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Lighting & Color */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <SectionTitle icon={<Aperture />} title="תאורה וצבע" />
          <div className="space-y-4">
            <div className="bg-slate-800/30 p-4 rounded-lg">
              <h4 className="font-bold text-slate-200 mb-2">תאורה</h4>
              <p className="text-slate-400 text-sm">{data.visual_style.lighting}</p>
            </div>
            <div className="bg-slate-800/30 p-4 rounded-lg">
              <h4 className="font-bold text-slate-200 mb-2">פלטת צבעים</h4>
              <p className="text-slate-400 text-sm">{data.visual_style.color_palette}</p>
            </div>
          </div>

           <div className="mt-8">
            <SectionTitle icon={<Video />} title="סמליות" />
             <div className="bg-slate-800/30 p-4 rounded-lg border-r-4 border-purple-500">
              <p className="text-slate-300 text-sm leading-relaxed">{data.symbolism}</p>
            </div>
          </div>
        </div>

        {/* Audio */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <SectionTitle icon={<Music />} title="פסקול וסאונד" />
          <ul className="space-y-3">
             <li className="flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-500 uppercase">מוזיקה</span>
                <span className="text-slate-300 text-sm">{data.audio_design.music}</span>
             </li>
             <li className="border-t border-slate-800 pt-3 flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-500 uppercase">אפקטים קוליים</span>
                <span className="text-slate-300 text-sm">{data.audio_design.sound_effects}</span>
             </li>
             <li className="border-t border-slate-800 pt-3 flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-500 uppercase">דיאלוג</span>
                <span className="text-slate-300 text-sm">{data.audio_design.dialogue}</span>
             </li>
          </ul>
        </div>

        {/* Editing */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <SectionTitle icon={<Scissors />} title="עריכה ומקצב" />
          <div className="space-y-4">
            <div>
               <h4 className="text-sm font-bold text-slate-200 mb-1">קצב (Pacing)</h4>
               <p className="text-slate-400 text-sm">{data.editing.pacing}</p>
            </div>
            <div>
               <h4 className="text-sm font-bold text-slate-200 mb-1">מעברים (Transitions)</h4>
               <p className="text-slate-400 text-sm">{data.editing.transitions}</p>
            </div>
             <div className="mt-4 p-3 bg-slate-800 rounded-lg">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">טון רגשי</h4>
                <p className="text-yellow-400 font-medium">{data.emotional_tone}</p>
            </div>
          </div>
        </div>

      </div>

      {data.sources && data.sources.length > 0 && (
        <div className="border-t border-slate-800 pt-6 mt-6">
          <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
            <Globe size={14} />
            מקורות המידע (YouTube/Google)
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.sources.map((source, idx) => (
              <a 
                key={idx}
                href={source.uri}
                target="_blank"
                rel="noreferrer"
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-full transition-colors border border-slate-700 hover:border-slate-500 truncate max-w-xs"
              >
                {source.title}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisResult;