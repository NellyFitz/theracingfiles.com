'use client';

import { useState, useRef } from 'react';
import { Upload, X, File, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface FileUploadProps {
  bucket: string;
  folder: string;
  accept: string;
  label: string;
  hint?: string;
  value: string | null;
  onChange: (url: string | null) => void;
}

export default function FileUpload({ bucket, folder, accept, label, hint, value, onChange }: FileUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setUploading(true);
    setError('');

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError('Not authenticated'); setUploading(false); return; }

    const ext = file.name.split('.').pop();
    const path = `${folder}/${user.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
    onChange(publicUrl);
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
  };

  const remove = () => {
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  if (value) {
    const filename = value.split('/').pop() ?? 'file';
    return (
      <div className="rounded-xl border border-[#39ff14]/30 bg-[#39ff14]/5 p-4 flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-[#39ff14] shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{label}</p>
          <p className="text-sm text-white truncate">{filename}</p>
        </div>
        <button onClick={remove} className="text-zinc-500 hover:text-red-400 transition-colors shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">{label}</p>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative rounded-xl border border-dashed p-6 text-center cursor-pointer transition-all ${
          dragging
            ? 'border-[#39ff14]/60 bg-[#39ff14]/5'
            : 'border-[#2a2a2a] hover:border-[#39ff14]/30 hover:bg-[#141414]'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 text-[#39ff14] animate-spin" />
            <p className="text-xs text-zinc-400">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-[#252525] flex items-center justify-center">
              {dragging ? <Upload className="w-5 h-5 text-[#39ff14]" /> : <File className="w-5 h-5 text-zinc-500" />}
            </div>
            <div>
              <p className="text-sm text-zinc-300">
                <span className="text-[#39ff14] font-semibold">Click to upload</span> or drag & drop
              </p>
              {hint && <p className="text-xs text-zinc-600 mt-0.5">{hint}</p>}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 mt-2 text-xs text-red-400">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
