import React, { useRef, useEffect, useState } from 'react';

interface MediaPlayerProps {
  src: string | null;
  seekTo?: number | null;
  fileType: 'audio' | 'video' | 'pdf' | null;
}

const MediaPlayer: React.FC<MediaPlayerProps> = ({ src, seekTo, fileType }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (seekTo !== null && seekTo !== undefined) {
      if (fileType === 'video' && videoRef.current) {
        videoRef.current.currentTime = seekTo;
        videoRef.current.play();
      } else if (fileType === 'audio' && audioRef.current) {
        audioRef.current.currentTime = seekTo;
        audioRef.current.play();
      }
    }
  }, [seekTo, fileType]);

  if (!src) return (
    <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
      Preview will appear here
    </div>
  );

  return (
    <div className="w-full bg-slate-900 rounded-2xl overflow-hidden shadow-xl aspect-video flex items-center justify-center">
      {fileType === 'video' && (
        <video 
          ref={videoRef}
          controls 
          className="w-full h-full"
          src={src}
        />
      )}
      {fileType === 'audio' && (
        <div className="flex flex-col items-center gap-6 p-12 w-full">
          <div className="w-24 h-24 bg-brand-500 rounded-full flex items-center justify-center text-4xl animate-pulse">
            🎵
          </div>
          <audio 
            ref={audioRef}
            controls 
            className="w-full"
            src={src}
          />
        </div>
      )}
      {fileType === 'pdf' && (
        <iframe 
          src={src} 
          className="w-full h-full bg-white"
          title="PDF Preview"
        />
      )}
    </div>
  );
};

export default MediaPlayer;
