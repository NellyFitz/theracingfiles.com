import type { Product } from './types';
import type { PartSubmission } from './supabase/db-types';

type SubWithCreator = PartSubmission & {
  user_profiles?: { name: string; handle: string } | null;
};

export function subToProduct(sub: SubWithCreator): Product {
  const fileTypes: ('STL' | '3MF' | 'STEP')[] = [];
  if (sub.stl_url)    fileTypes.push('STL');
  if (sub.threemf_url) fileTypes.push('3MF');
  if (sub.step_url)   fileTypes.push('STEP');

  return {
    id: sub.id,
    slug: sub.id,
    name: sub.name,
    shortName: sub.name.length > 35 ? sub.name.slice(0, 35) + '…' : sub.name,
    category: sub.category,
    vehicleType: sub.vehicle_type as Product['vehicleType'],
    make: sub.make,
    model: sub.model,
    yearStart: sub.year_start,
    yearEnd: sub.year_end,
    fitment: sub.fitment,
    filePrice: sub.file_price,
    printedPrice: sub.printed_price ?? null,
    finishedAvailable: sub.finished_available,
    fileTypes,
    material: sub.material,
    difficulty: sub.difficulty as Product['difficulty'],
    badges: [],
    imageUrl: sub.images?.[0] ?? '',
    creatorId: sub.creator_id,
    creatorName: sub.user_profiles?.name ?? '',
    creatorHandle: sub.user_profiles?.handle ?? '',
    rating: 0,
    reviewCount: 0,
    description: sub.description ?? '',
    fitmentNotes: sub.fitment_notes ?? '',
    printSettings: {
      layerHeight: sub.print_layer_height ?? '',
      infill: sub.print_infill ?? '',
      supports: sub.print_supports ?? false,
      bedTemp: sub.print_bed_temp ?? '',
      nozzleTemp: sub.print_nozzle_temp ?? '',
      material: sub.material ?? '',
    },
    installNotes: sub.install_notes ?? '',
    tags: sub.tags ? sub.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    featured: false,
  };
}
