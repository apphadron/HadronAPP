export interface QRCodeData {
  type: 'image' | 'video' | '3d';
  url: string;
  title?: string;
  description?: string;
}

export interface ARContent {
  id: string;
  type: 'image' | 'video' | '3d';
  url: string;
  title?: string;
  description?: string;
  position?: {
    x: number;
    y: number;
    z: number;
  };
  rotation?: {
    x: number;
    y: number;
    z: number;
  };
  scale?: {
    x: number;
    y: number;
    z: number;
  };
}

export interface CameraPermissions {
  granted: boolean;
  canAskAgain: boolean;
}

