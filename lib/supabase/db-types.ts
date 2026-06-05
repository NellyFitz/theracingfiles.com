export type SubmissionStatus = 'pending' | 'under_review' | 'approved' | 'rejected';

export interface CreatorProfile {
  id: string;
  name: string;
  handle: string;
  bio: string | null;
  website: string | null;
  software: string | null;
  experience_level: string | null;
  vehicle_specialties: string | null;
  verified: boolean;
  approved: boolean;
  created_at: string;
}

export interface PartSubmission {
  id: string;
  creator_id: string;
  name: string;
  category: string;
  vehicle_type: string;
  make: string;
  model: string;
  year_start: number;
  year_end: number;
  fitment: string;
  file_price: number;
  printed_price: number | null;
  finished_available: boolean;
  material: string;
  difficulty: string;
  description: string;
  fitment_notes: string;
  install_notes: string;
  print_layer_height: string;
  print_infill: string;
  print_supports: boolean;
  print_nozzle_temp: string;
  print_bed_temp: string;
  stl_url: string | null;
  threemf_url: string | null;
  obj_url: string | null;
  mtl_url: string | null;
  step_url: string | null;
  images: string[];
  tags: string;
  status: SubmissionStatus;
  admin_notes: string | null;
  reviewed_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  user_profiles?: CreatorProfile;
}

export interface CreatorApplication {
  id: string;
  name: string;
  email: string;
  portfolio: string | null;
  experience: string | null;
  software: string | null;
  motivation: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}
