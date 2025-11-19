// Image configuration - updated with real filenames from Desktop folders
// Structure supports alt text for accessibility and SEO

import { ImageData, VideoData, Category } from '../types';
import danceData from './dance.json';
import weddingData from './wedding.json';
import artData from './art.json';
import videosData from './videos.json';

export const CATEGORIES: Category[] = ['dance', 'wedding', 'art'];

const baseUrl =
  'https://afziltusqfvlckjbgkil.supabase.co/storage/v1/object/public/grainy-bits';

// Ensure all data is loaded before creating imageConfig
export const imageConfig: {
  dance: ImageData[];
  wedding: ImageData[];
  art: ImageData[];
  videos: VideoData[];
} = {
  dance: (danceData as ImageData[]) || [],
  wedding: (weddingData as ImageData[]) || [],
  art: (artData as ImageData[]) || [],
  videos: (videosData as VideoData[]) || [],
};

export const getImageUrl = (folder: string, filename: string): string => {
  return `${baseUrl}/${folder}/${filename}`;
};

export const getImagesForCategory = (category: Category | 'videos'): (ImageData | VideoData)[] => {
  const folderMap: Record<Category, string> = {
    dance: 'Dance',
    wedding: 'Wedding',
    art: 'Art',
  };

  // Handle videos differently
  if (category === 'videos') {
    return imageConfig.videos || [];
  }

  const folder = folderMap[category];
  const images = imageConfig[category] || [];

  return images.map((image) => ({
    filename: image.filename,
    alt: image.alt || `${category} photography`,
    url: getImageUrl(folder, image.filename),
  }));
};

// Get all images from all categories for banner use
export const getAllImages = (): ImageData[] => {
  const folderMap: Record<Category, string> = {
    dance: 'Dance',
    wedding: 'Wedding',
    art: 'Art',
  };

  const allImages: ImageData[] = [];

  Object.keys(folderMap).forEach((category) => {
    const folder = folderMap[category as Category];
    const images = imageConfig[category as Category] || [];
    images.forEach((image) => {
      allImages.push({
        filename: image.filename,
        alt: image.alt || `${category} photography`,
        url: getImageUrl(folder, image.filename),
        category: category as Category,
      });
    });
  });

  return allImages;
};

// Shuffle array randomly (Fisher-Yates algorithm)
export const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

