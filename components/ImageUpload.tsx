'use client';

import { useState, useRef } from 'react';
import { ImagePlus, X, Loader2, AlertCircle, GripVertical } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

export default function ImageUpload({ value, onChange, maxImages = 6 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const dragNode = useRef<HTMLDivElement | null>(null);

  const upload = async (files: FileList) => {
    setUploading(true);
    setError('');
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError('Not authenticated'); setUploading(false); return; }

    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      if (value.length + newUrls.length >= maxImages) break;
      const ext = file.name.split('.').pop();
      const path = `submissions/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('part-images').upload(path, file, { cacheControl: '3600' });
      if (uploadError) { setError(uploadError.message); continue; }
      const { data: { publicUrl } } = supabase.storage.from('part-images').getPublicUrl(path);
      newUrls.push(publicUrl);
    }
    onChange([...value, ...newUrls]);
    setUploading(false);
  };

  const remove = (url: string) => onChange(value.filter((u) => u !== url));

  const onDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // ghost image delay so state sets first
    setTimeout(() => { if (dragNode.current) dragNode.current.style.opacity = '0.4'; }, 0);
  };

  const onDragEnter = (index: number) => {
    if (dragIndex === null || dragIndex === index) return;
    setOverIndex(index);
  };

  const onDragEnd = () => {
    if (dragNode.current) dragNode.current.style.opacity = '1';
    if (dragIndex !== null && overIndex !== null && dragIndex !== overIndex) {
      const reordered = [...value];
      const [moved] = reordered.splice(dragIndex, 1);
      reordered.splice(overIndex, 0, moved);
      onChange(reordered);
    }
    setDragIndex(null);
    setOverIndex(null);
    dragNode.current = null;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
          Product Images ({value.length}/{maxImages})
        </p>
        {value.length > 1 && (
          <p className="text-[10px] text-zinc-600">Drag to reorder · First image is the cover</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {value.map((url, index) => (
          <div
            key={url}
            draggable
            onDragStart={(e) => { dragNode.current = e.currentTarget as HTMLDivElement; onDragStart(e, index); }}
            onDragEnter={() => onDragEnter(index)}
            onDragOver={(e) => e.preventDefault()}
            onDragEnd={onDragEnd}
            className={`relative aspect-square rounded-lg overflow-hidden border transition-all cursor-grab active:cursor-grabbing ${
              overIndex === index && dragIndex !== index
                ? 'border-[#39ff14] scale-105'
                : dragIndex === index
                ? 'border-[#2a2a2a] opacity-40'
                : 'border-[#2a2a2a]'
            } group`}
          >
            {/* Cover badge */}
            {index === 0 && (
              <div className="absolute top-1.5 left-1.5 z-10 bg-[#39ff14] text-black text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest">
                Cover
              </div>
            )}

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="Part photo" className="w-full h-full object-cover pointer-events-none" />

            {/* Drag handle hint */}
            <div className="absolute bottom-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="w-4 h-4 text-white drop-shadow-md" />
            </div>

            {/* Remove button */}
            <button
              onClick={() => remove(url)}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ))}

        {value.length < maxImages && (
          <label className={`aspect-square rounded-lg border border-dashed border-[#2a2a2a] flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-[#39ff14]/30 hover:bg-[#141414] transition-all ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(e) => e.target.files && upload(e.target.files)}
              className="hidden"
            />
            {uploading
              ? <Loader2 className="w-5 h-5 text-[#39ff14] animate-spin" />
              : <ImagePlus className="w-5 h-5 text-zinc-600" />
            }
            <p className="text-[10px] text-zinc-600">Add photo</p>
          </label>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 mt-2 text-xs text-red-400">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </div>
      )}
      <p className="text-[10px] text-zinc-600 mt-2">JPG, PNG, WEBP · Max 10MB each · Up to {maxImages} images · Drag to reorder</p>
    </div>
  );
}
