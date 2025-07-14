import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Clock, AlertCircle } from 'lucide-react';
import { urlService } from '@/services/urlService';
import { logger } from '@/services/logger';

const RedirectHandler: React.FC = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [status, setStatus] = useState<'loading' | 'redirecting' | 'not-found' | 'expired'>('loading');
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!shortCode) {
      setStatus('not-found');
      return;
    }

    logger.info('Attempting to redirect', { shortCode }, 'RedirectHandler');

    // Record click and get original URL
    const redirectUrl = urlService.recordClickAndRedirect(shortCode, 'direct');
    
    if (!redirectUrl) {
      // Check if URL exists but is expired
      const allUrls = urlService.getAllUrls();
      const existingUrl = allUrls.find(url => url.shortCode === shortCode);
      
      if (existingUrl && existingUrl.isExpired) {
        setStatus('expired');
        logger.warn('Attempted to access expired URL', { shortCode }, 'RedirectHandler');
      } else {
        setStatus('not-found');
        logger.warn('Short code not found', { shortCode }, 'RedirectHandler');
      }
      return;
    }

    setOriginalUrl(redirectUrl);
    setStatus('redirecting');
    
    // Start countdown
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = redirectUrl;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [shortCode]);

  const handleManualRedirect = () => {
    if (originalUrl) {
      window.location.href = originalUrl;
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'not-found') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>Short URL Not Found</CardTitle>
            <CardDescription>
              The short URL "/{shortCode}" does not exist or has been deleted.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <a href="/">Create New Short URL</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'expired') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Clock className="h-12 w-12 text-warning mx-auto mb-4" />
            <CardTitle>Short URL Expired</CardTitle>
            <CardDescription>
              The short URL "/{shortCode}" has expired and is no longer valid.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <a href="/">Create New Short URL</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <ExternalLink className="h-12 w-12 text-primary mx-auto mb-4" />
          <CardTitle>Redirecting...</CardTitle>
          <CardDescription>
            You will be redirected to your destination in {countdown} seconds.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Destination:</p>
            <p className="text-sm font-mono bg-muted p-2 rounded break-all">
              {originalUrl}
            </p>
          </div>
          
          <div className="text-center space-y-2">
            <Button onClick={handleManualRedirect} className="w-full">
              Go Now
            </Button>
            <Button variant="outline" asChild className="w-full">
              <a href="/">Cancel</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RedirectHandler;