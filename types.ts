export interface ProcessedImage {
  original: string; // Base64 data URL
  processed: string | null; // Base64 data URL
  mimeType: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface ProcessingError {
  message: string;
  details?: string;
}
