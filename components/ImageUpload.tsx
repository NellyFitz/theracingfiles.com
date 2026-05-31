'use client';

import { useState } from 'react';
import { ImagePlus, X, Loader2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

export default function ImageUpload({ value, onChange, maxImages = 6 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

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

      const { error: uploadError } = await supabase.storage.from('part-images').upload(path, file, {
        cacheControl: '3600',
      });

      if (uploadError) {
        setError(uploadError.message);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage.from('part-images').getPublicUrl(path);
      newUrls.push(publicUrl);
    }

    onChange([...value, ...newUrls]);
    setUploading(false);
  };

  const remove = (url: string) => onChange(value.filter((u) => u !== url));

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
        Product Images ({value.length}/{maxImages})
      </p>

      <div className="grid grid-cols-3 gap-3">
        {value.map((url) => (
          <div key={url} className="relative aspect-square rounded-lg overflow-hidden border border-[#2a2a2a] group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="Part photo" className="w-full h-full object-cover" />
            <button
              onClick={() => remove(url)}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
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
      <p className="text-[10px] text-zinc-600 mt-2">JPG, PNG, WEBP · Max 10MB each · Up to {maxImages} images</p>
    </div>
  );
}
