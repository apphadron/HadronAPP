export interface Video {
    id: string;
    youtubeId: string;
    category: string;
  }
  
  export interface Category {
    id: string;
    name: string;
    videos: Video[];
  }