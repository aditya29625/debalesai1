import React, { useState } from 'react';

interface UploadSectionProps {
  onUploadSuccess: (collectionId: string, filename: string, file: File) => void;
}

const UploadSection: React.FC<UploadSectionProps> = ({ onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    
    let fileType = 'pdf';
    if (file.type.startsWith('audio/')) fileType = 'audio';
    if (file.type.startsWith('video/')) fileType = 'video';
    formData.append('file_type', fileType);

    try {
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      
      const data = await response.json();
      onUploadSuccess(data.collection_id, file.name, file);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-8 border-2 border-dashed border-slate-300 rounded-2xl bg-white/50 hover:bg-white/80 transition-all flex flex-col items-center justify-center gap-4 text-center">
      <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-3xl">
        📤
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">Upload your content</h3>
        <p className="text-slate-500 max-w-xs">
          Supported formats: PDF, MP3, MP4, WAV. Max size: 50MB.
        </p>
      </div>
      
      <label className="cursor-pointer bg-slate-800 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-900 transition-colors shadow-lg">
        {isUploading ? 'Processing...' : 'Choose File'}
        <input 
          type="file" 
          className="hidden" 
          onChange={handleFileChange} 
          disabled={isUploading}
          accept=".pdf,audio/*,video/*"
        />
      </label>

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default UploadSection;
