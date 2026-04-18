import { useState } from 'react';
import UploadSection from './components/UploadSection';
import ChatInterface from './components/ChatInterface';
import MediaPlayer from './components/MediaPlayer';

function App() {
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'audio' | 'video' | 'pdf' | null>(null);
  const [seekTo, setSeekTo] = useState<number | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [fileSrc, setFileSrc] = useState<string | null>(null);

  const handleUploadSuccess = async (id: string, name: string, file: File) => {
    setCollectionId(id);
    setFilename(name);

    // Create a local URL for the media player
    if (fileSrc) URL.revokeObjectURL(fileSrc);
    const url = URL.createObjectURL(file);
    setFileSrc(url);
    
    let type: 'pdf' | 'audio' | 'video' = 'pdf';
    if (name.endsWith('.mp3') || name.endsWith('.wav')) type = 'audio';
    if (name.endsWith('.mp4') || name.endsWith('.mov')) type = 'video';
    setFileType(type);

    // Fetch summary automatically
    try {
      const res = await fetch(`http://localhost:8000/summary/${id}`);
      const data = await res.json();
      setSummary(data.summary);
    } catch (err) {
      console.error("Failed to fetch summary", err);
    }
  };

  const handlePlayTimestamp = (time: number) => {
    setSeekTo(time);
    // Reset seekTo after a short delay so it can be triggered again for the same value
    setTimeout(() => setSeekTo(null), 100);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-8 sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-brand-100">
            A
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-indigo-600">
            Aurore Multimedia Q&A
          </h1>
        </div>
        {filename && (
          <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full text-sm font-medium text-slate-600">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            {filename}
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Upload & Player */}
        <div className="space-y-6">
          {!collectionId ? (
            <UploadSection onUploadSuccess={handleUploadSuccess} />
          ) : (
            <>
              <MediaPlayer 
                src={fileSrc}
                fileType={fileType}
                seekTo={seekTo}
              />
              
              {summary && (
                <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl">
                  <h4 className="text-indigo-900 font-bold mb-2 flex items-center gap-2">
                    ✨ AI Summary
                  </h4>
                  <p className="text-indigo-800/80 text-sm leading-relaxed">
                    {summary}
                  </p>
                </div>
              )}

              <button 
                onClick={() => { setCollectionId(null); setFilename(null); setSummary(null); }}
                className="text-slate-400 text-sm hover:text-brand-600 transition-colors flex items-center gap-1"
              >
                ← Upload a different file
              </button>
            </>
          )}
        </div>

        {/* Right Column: Chat */}
        <div className="h-full">
          {collectionId ? (
            <ChatInterface 
              collectionId={collectionId} 
              onPlayTimestamp={handlePlayTimestamp}
            />
          ) : (
            <div className="h-[600px] bg-white/50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-4">
              <div className="text-4xl opacity-50">💬</div>
              <p>Upload a file to start chatting with AI</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-slate-400 text-sm">
        Powered by Google Gemini 1.5
      </footer>
    </div>
  );
}

export default App;
