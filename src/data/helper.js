// Image configuration - updated with real filenames from Desktop folders
// Structure supports alt text for accessibility and SEO

export const CATEGORIES = ['dance', 'wedding', 'art'];

import danceData from './dance.json';
import weddingData from './wedding.json';
import artData from './art.json';
import videosData from './videos.json';

const baseUrl =
  'https://afziltusqfvlckjbgkil.supabase.co/storage/v1/object/public/grainy-bits';

// Ensure all data is loaded before creating imageConfig
export const imageConfig = {
  dance: danceData || [],
  wedding: weddingData || [],
  art: artData || [],
  videos: videosData || [],
};

export const getImageUrl = (folder, filename) => {
  return `${baseUrl}/${folder}/${filename}`;
};

export const getImagesForCategory = (category) => {
  const folderMap = {
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
export const getAllImages = () => {
  const folderMap = {
    dance: 'Dance',
    wedding: 'Wedding',
    art: 'Art',
  };

  const allImages = [];

  Object.keys(folderMap).forEach((category) => {
    const folder = folderMap[category];
    const images = imageConfig[category] || [];
    images.forEach((image) => {
      allImages.push({
        filename: image.filename,
        alt: image.alt || `${category} photography`,
        url: getImageUrl(folder, image.filename),
        category,
      });
    });
  });

  return allImages;
};

// Shuffle array randomly (Fisher-Yates algorithm)
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
