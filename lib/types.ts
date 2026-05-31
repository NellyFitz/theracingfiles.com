export type BadgeType = 'verified' | 'community' | 'prototype' | 'scan-available' | 'part-available';

export type FileType = 'STL' | '3MF' | 'STEP';

export type PrintDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type FulfillmentType = 'digital' | 'printed' | 'finished';

export interface Badge {
  type: BadgeType;
  label: string;
}

export interface PrintSettings {
  layerHeight: string;
  infill: string;
  supports: boolean;
  bedTemp: string;
  nozzleTemp: string;
  material: string;
}

export interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  body: string;
  vehicle: string;
  verified: boolean;
}

export interface Creator {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  partCount: number;
  sales: number;
  rating: number;
  badges: string[];
  joinDate: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  category: string;
  vehicleType: 'Car' | 'Motorcycle' | 'Truck' | 'Tool';
  make: string;
  model: string;
  yearStart: number;
  yearEnd: number;
  fitment: string;
  filePrice: number;
  printedPrice: number | null;
  finishedAvailable: boolean;
  fileTypes: FileType[];
  material: string;
  difficulty: PrintDifficulty;
  badges: Badge[];
  imageUrl: string;
  creatorId: string;
  rating: number;
  reviewCount: number;
  description: string;
  fitmentNotes: string;
  printSettings: PrintSettings;
  installNotes: string;
  tags: string[];
  featured: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
  description: string;
}

export interface RequestFormData {
  name: string;
  email: string;
  vehicleYear: string;
  make: string;
  model: string;
  partNeeded: string;
  fulfillmentType: FulfillmentType;
  notes: string;
}

export interface CreatorApplication {
  name: string;
  email: string;
  portfolio: string;
  experience: string;
  software: string;
  motivation: string;
}

export interface FilterState {
  vehicleType: string;
  make: string;
  model: string;
  category: string;
  fileType: string;
  verifiedOnly: boolean;
  printedAvailable: boolean;
  search: string;
}
