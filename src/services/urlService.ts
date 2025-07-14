import { ShortenedUrl, CreateUrlRequest, ClickData, GeolocationData } from '@/types/url';
import { logger } from './logger';

class UrlService {
  private urls: Map<string, ShortenedUrl> = new Map();
  private readonly STORAGE_KEY = 'url_shortener_data';

  constructor() {
    this.loadFromStorage();
    logger.info('UrlService initialized', { urlCount: this.urls.size }, 'UrlService');
  }

  // Generate a random short code
  private generateShortCode(length: number = 6): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  // Check if short code already exists
  private isShortCodeTaken(shortCode: string): boolean {
    return Array.from(this.urls.values()).some(url => url.shortCode === shortCode);
  }

  // Generate unique short code
  private generateUniqueShortCode(): string {
    let shortCode: string;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      shortCode = this.generateShortCode();
      attempts++;
      if (attempts > maxAttempts) {
        shortCode = this.generateShortCode(8); // Increase length if too many collisions
        break;
      }
    } while (this.isShortCodeTaken(shortCode));

    return shortCode;
  }

  // Validate URL format
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Validate short code format
  private isValidShortCode(shortCode: string): boolean {
    const regex = /^[A-Za-z0-9]{1,20}$/;
    return regex.test(shortCode);
  }

  // Create shortened URL
  createShortenedUrl(request: CreateUrlRequest): ShortenedUrl {
    logger.info('Creating shortened URL', request, 'UrlService');

    // Validate original URL
    if (!this.isValidUrl(request.originalUrl)) {
      const error = new Error('Invalid URL format');
      logger.error('URL validation failed', { url: request.originalUrl }, 'UrlService');
      throw error;
    }

    // Determine short code
    let shortCode: string;
    if (request.customShortCode) {
      if (!this.isValidShortCode(request.customShortCode)) {
        const error = new Error('Invalid short code format. Use only alphanumeric characters (1-20 chars)');
        logger.error('Short code validation failed', { shortCode: request.customShortCode }, 'UrlService');
        throw error;
      }
      if (this.isShortCodeTaken(request.customShortCode)) {
        const error = new Error('Short code already exists. Please choose a different one.');
        logger.error('Short code collision', { shortCode: request.customShortCode }, 'UrlService');
        throw error;
      }
      shortCode = request.customShortCode;
    } else {
      shortCode = this.generateUniqueShortCode();
    }

    // Calculate expiry
    const validityMinutes = request.validityMinutes || 30;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + validityMinutes * 60 * 1000);

    // Create URL object
    const shortenedUrl: ShortenedUrl = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      originalUrl: request.originalUrl,
      shortCode,
      customCode: request.customShortCode,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      isExpired: false,
      clicks: [],
      totalClicks: 0
    };

    this.urls.set(shortenedUrl.id, shortenedUrl);
    this.saveToStorage();

    logger.info('Shortened URL created successfully', { 
      id: shortenedUrl.id, 
      shortCode, 
      expiresAt: shortenedUrl.expiresAt 
    }, 'UrlService');

    return shortenedUrl;
  }

  // Get URL by short code
  getUrlByShortCode(shortCode: string): ShortenedUrl | null {
    const url = Array.from(this.urls.values()).find(u => u.shortCode === shortCode);
    if (!url) {
      logger.warn('Short code not found', { shortCode }, 'UrlService');
      return null;
    }

    // Check if expired
    if (new Date() > new Date(url.expiresAt)) {
      url.isExpired = true;
      this.saveToStorage();
      logger.warn('Attempted to access expired URL', { shortCode, expiresAt: url.expiresAt }, 'UrlService');
      return null;
    }

    return url;
  }

  // Record click and redirect
  recordClickAndRedirect(shortCode: string, source: string = 'direct'): string | null {
    const url = this.getUrlByShortCode(shortCode);
    if (!url) {
      return null;
    }

    // Record click
    const clickData: ClickData = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      source,
      location: this.getLocationData().country, // Simplified location
      userAgent: navigator.userAgent
    };

    url.clicks.push(clickData);
    url.totalClicks = url.clicks.length;
    
    this.saveToStorage();

    logger.info('Click recorded', { 
      shortCode, 
      clickId: clickData.id, 
      totalClicks: url.totalClicks 
    }, 'UrlService');

    return url.originalUrl;
  }

  // Get location data (simplified for demo)
  private getLocationData(): GeolocationData {
    // In a real app, you would use an IP geolocation service
    return {
      country: 'Unknown',
      region: 'Unknown', 
      city: 'Unknown'
    };
  }

  // Get all URLs
  getAllUrls(): ShortenedUrl[] {
    const urls = Array.from(this.urls.values());
    
    // Update expired status
    urls.forEach(url => {
      if (new Date() > new Date(url.expiresAt)) {
        url.isExpired = true;
      }
    });

    this.saveToStorage();
    return urls.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Delete URL
  deleteUrl(id: string): boolean {
    const deleted = this.urls.delete(id);
    if (deleted) {
      this.saveToStorage();
      logger.info('URL deleted', { id }, 'UrlService');
    }
    return deleted;
  }

  // Save to localStorage
  private saveToStorage(): void {
    try {
      const data = Array.from(this.urls.entries());
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      logger.error('Failed to save to storage', error, 'UrlService');
    }
  }

  // Load from localStorage
  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const entries = JSON.parse(data);
        this.urls = new Map(entries);
        logger.info('Data loaded from storage', { urlCount: this.urls.size }, 'UrlService');
      }
    } catch (error) {
      logger.error('Failed to load from storage', error, 'UrlService');
    }
  }

  // Clear all data
  clearAllData(): void {
    this.urls.clear();
    localStorage.removeItem(this.STORAGE_KEY);
    logger.info('All data cleared', {}, 'UrlService');
  }
}

export const urlService = new UrlService();