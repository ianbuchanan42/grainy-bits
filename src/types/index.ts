export interface ImageData {
  filename: string;
  alt: string;
  url?: string;
  category?: string;
}

export interface VideoData {
  id: string;
  title: string;
  description: string;
  credits: {
    choreography?: string;
    editing?: string;
    videography?: string;
    music?: string;
    [key: string]: string | undefined;
  };
  location?: string;
  locations?: string[];
  youtubeId: string;
  type: string;
  poem?: {
    title: string;
    author: string;
    copyright: string;
  };
}

export type Category = 'dance' | 'wedding' | 'art';

export type TabId = 'home' | 'dance' | 'wedding' | 'art' | 'videos';

