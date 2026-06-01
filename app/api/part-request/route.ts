import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const vehicleYear = formData.get('vehicleYear') as string;
    const make = formData.get('make') as string;
    const model = formData.get('model') as string;
    const partNeeded = formData.get('partNeeded') as string;
    const fulfillmentType = formData.get('fulfillmentType') as string;
    const notes = formData.get('notes') as string;
    const images = formData.getAll('images') as File[];

    const supabase = createAdminClient();

    // Upload images to Supabase Storage
    const imageUrls: string[] = [];
    for (const image of images) {
      if (!image || image.size === 0) continue;
      const ext = image.name.split('.').pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('request-images')
        .upload(path, image, { contentType: image.type });
      if (uploadError) {
        console.error('Image upload error:', uploadError);
        continue;
      }
      const { data: urlData } = supabase.storage
        .from('request-images')
        .getPublicUrl(path);
      imageUrls.push(urlData.publicUrl);
    }

    const { error } = await supabase.from('part_requests').insert({
      name,
      email,
      vehicle_year: vehicleYear,
      make,
      model,
      part_needed: partNeeded,
      fulfillment_type: fulfillmentType,
      notes: notes || null,
      image_urls: imageUrls.length > 0 ? imageUrls : null,
    });

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('part-request route error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
