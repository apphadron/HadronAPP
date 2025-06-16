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

  export type DataPoint = {
    id: string;
    value: string;
  };
  
  export type RegressionDataPoint = {
    id: string;
    x: string;
    y: string;
  };
  
  export type StdDevResult = {
    mean: number;
    sampleStdDev: number;
    populationStdDev: number;
  };
  
  export type RegressionResult = {
    slope: number;
    intercept: number;
    rSquared: number;
    equation: string;
  };