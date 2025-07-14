export interface ShortenedUrl {
  id: string;
  originalUrl: string;
  shortCode: string;
  customCode?: string;
  createdAt: string;
  expiresAt: string;
  isExpired: boolean;
  clicks: ClickData[];
  totalClicks: number;
}

export interface ClickData {
  id: string;
  timestamp: string;
  source: string;
  location: string;
  userAgent?: string;
}

export interface CreateUrlRequest {
  originalUrl: string;
  validityMinutes?: number;
  customShortCode?: string;
}

export interface UrlFormData {
  originalUrl: string;
  validityMinutes: string;
  customShortCode: string;
}

export interface UrlValidationError {
  field: string;
  message: string;
}

export interface GeolocationData {
  country: string;
  region: string;
  city: string;
}