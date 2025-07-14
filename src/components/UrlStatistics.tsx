import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart3, 
  ExternalLink, 
  Clock, 
  MousePointer, 
  Calendar,
  MapPin,
  Monitor,
  Copy,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { urlService } from '@/services/urlService';
import { logger } from '@/services/logger';
import { ShortenedUrl, ClickData } from '@/types/url';
import { useToast } from '@/hooks/use-toast';

const UrlStatistics: React.FC = () => {
  const { toast } = useToast();
  const [urls, setUrls] = useState<ShortenedUrl[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedUrl, setExpandedUrl] = useState<string | null>(null);

  // Load URLs
  const loadUrls = () => {
    setIsLoading(true);
    try {
      const allUrls = urlService.getAllUrls();
      setUrls(allUrls);
      logger.info('URLs loaded for statistics', { count: allUrls.length }, 'UrlStatistics');
    } catch (error) {
      logger.error('Failed to load URLs', error, 'UrlStatistics');
      toast({
        title: "Error loading URLs",
        description: "Failed to load URL statistics",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUrls();
  }, []);

  // Delete URL
  const deleteUrl = (id: string, shortCode: string) => {
    if (window.confirm(`Are you sure you want to delete the short URL "${shortCode}"?`)) {
      try {
        urlService.deleteUrl(id);
        loadUrls(); // Refresh the list
        toast({
          title: "URL Deleted",
          description: `Short URL "${shortCode}" has been deleted`,
        });
        logger.info('URL deleted from statistics', { id, shortCode }, 'UrlStatistics');
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete URL",
          variant: "destructive"
        });
        logger.error('Failed to delete URL', { error, id }, 'UrlStatistics');
      }
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    }).catch(() => {
      toast({
        title: "Copy failed",
        description: "Please copy manually",
        variant: "destructive"
      });
    });
  };

  // Toggle expanded view
  const toggleExpanded = (urlId: string) => {
    setExpandedUrl(expandedUrl === urlId ? null : urlId);
  };

  // Format date and time
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Get time until expiry
  const getTimeUntilExpiry = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins <= 0) return 'Expired';
    if (diffMins < 60) return `${diffMins}m remaining`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ${diffMins % 60}m remaining`;
    return `${Math.floor(diffMins / 1440)}d ${Math.floor((diffMins % 1440) / 60)}h remaining`;
  };

  // Get short URL
  const getShortUrl = (shortCode: string) => `${window.location.origin}/${shortCode}`;

  // Get click analytics
  const getClickAnalytics = (clicks: ClickData[]) => {
    const sourceCount: Record<string, number> = {};
    const locationCount: Record<string, number> = {};
    const hourlyClicks: Record<string, number> = {};

    clicks.forEach(click => {
      // Count sources
      sourceCount[click.source] = (sourceCount[click.source] || 0) + 1;
      
      // Count locations
      locationCount[click.location] = (locationCount[click.location] || 0) + 1;
      
      // Count hourly clicks
      const hour = new Date(click.timestamp).getHours();
      const hourKey = `${hour}:00`;
      hourlyClicks[hourKey] = (hourlyClicks[hourKey] || 0) + 1;
    });

    return { sourceCount, locationCount, hourlyClicks };
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading URL statistics...</p>
        </div>
      </div>
    );
  }

  if (urls.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center space-y-2 mb-6">
          <h1 className="text-3xl font-bold text-foreground">URL Statistics</h1>
          <p className="text-muted-foreground">View analytics and manage your shortened URLs</p>
        </div>
        
        <Alert>
          <BarChart3 className="h-4 w-4" />
          <AlertDescription>
            No shortened URLs found. Create some URLs first to see statistics here.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">URL Statistics</h1>
        <p className="text-muted-foreground">
          Analytics and insights for your {urls.length} shortened URLs
        </p>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={loadUrls}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ExternalLink className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total URLs</p>
                <p className="text-2xl font-bold">{urls.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MousePointer className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Total Clicks</p>
                <p className="text-2xl font-bold">
                  {urls.reduce((sum, url) => sum + url.totalClicks, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Active URLs</p>
                <p className="text-2xl font-bold">
                  {urls.filter(url => !url.isExpired).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Expired URLs</p>
                <p className="text-2xl font-bold">
                  {urls.filter(url => url.isExpired).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* URL List */}
      <div className="space-y-4">
        {urls.map((url) => {
          const isExpanded = expandedUrl === url.id;
          const analytics = getClickAnalytics(url.clicks);
          
          return (
            <Card key={url.id} className={url.isExpired ? 'opacity-75' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">
                        Short URL: /{url.shortCode}
                      </CardTitle>
                      <Badge variant={url.isExpired ? "destructive" : "secondary"}>
                        {url.isExpired ? 'Expired' : 'Active'}
                      </Badge>
                      {url.customCode && (
                        <Badge variant="outline">Custom</Badge>
                      )}
                    </div>
                    <CardDescription className="break-all">
                      {url.originalUrl}
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(getShortUrl(url.shortCode), 'Short URL')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteUrl(url.id, url.shortCode)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Created</p>
                      <p>{formatDateTime(url.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <p className={url.isExpired ? 'text-destructive' : 'text-success'}>
                        {getTimeUntilExpiry(url.expiresAt)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MousePointer className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Total Clicks</p>
                      <p className="font-semibold">{url.totalClicks}</p>
                    </div>
                  </div>
                </div>

                {/* Click Details Toggle */}
                {url.totalClicks > 0 && (
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleExpanded(url.id)}
                    >
                      {isExpanded ? 'Hide Details' : 'Show Click Details'}
                    </Button>
                  </div>
                )}

                {/* Expanded Analytics */}
                {isExpanded && url.totalClicks > 0 && (
                  <div className="space-y-4 border-t border-border pt-4">
                    {/* Analytics Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Click Sources</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-1">
                            {Object.entries(analytics.sourceCount).map(([source, count]) => (
                              <div key={source} className="flex justify-between text-sm">
                                <span className="capitalize">{source}</span>
                                <span className="font-medium">{count}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Locations</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-1">
                            {Object.entries(analytics.locationCount).map(([location, count]) => (
                              <div key={location} className="flex justify-between text-sm">
                                <span>{location}</span>
                                <span className="font-medium">{count}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-1">
                            {url.clicks.slice(0, 3).map((click) => (
                              <div key={click.id} className="text-sm">
                                <p className="font-medium">
                                  {new Date(click.timestamp).toLocaleString()}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                  from {click.source}
                                </p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Detailed Click List */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">All Clicks ({url.totalClicks})</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {url.clicks.map((click) => (
                            <div key={click.id} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3 text-muted-foreground" />
                                  <span>{formatDateTime(click.timestamp)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Monitor className="h-3 w-3 text-muted-foreground" />
                                  <span className="capitalize">{click.source}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-muted-foreground" />
                                  <span>{click.location}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default UrlStatistics;