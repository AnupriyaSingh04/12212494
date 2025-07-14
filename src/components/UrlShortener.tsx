import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Copy, Link, ExternalLink, Clock, Trash2 } from 'lucide-react';
import { urlService } from '@/services/urlService';
import { logger } from '@/services/logger';
import { ShortenedUrl, UrlFormData, UrlValidationError } from '@/types/url';
import { useToast } from '@/hooks/use-toast';

const UrlShortener: React.FC = () => {
  const { toast } = useToast();
  const [forms, setForms] = useState<UrlFormData[]>([
    { originalUrl: '', validityMinutes: '30', customShortCode: '' }
  ]);
  const [results, setResults] = useState<ShortenedUrl[]>([]);
  const [errors, setErrors] = useState<Record<number, UrlValidationError[]>>({});
  const [isLoading, setIsLoading] = useState<Record<number, boolean>>({});

  // Add new form
  const addForm = () => {
    if (forms.length < 5) {
      setForms([...forms, { originalUrl: '', validityMinutes: '30', customShortCode: '' }]);
      logger.info('New URL form added', { totalForms: forms.length + 1 }, 'UrlShortener');
    }
  };

  // Remove form
  const removeForm = (index: number) => {
    if (forms.length > 1) {
      const newForms = forms.filter((_, i) => i !== index);
      setForms(newForms);
      
      // Clear errors for removed form
      const newErrors = { ...errors };
      delete newErrors[index];
      setErrors(newErrors);
      
      logger.info('URL form removed', { removedIndex: index, totalForms: newForms.length }, 'UrlShortener');
    }
  };

  // Update form data
  const updateForm = (index: number, field: keyof UrlFormData, value: string) => {
    const newForms = [...forms];
    newForms[index] = { ...newForms[index], [field]: value };
    setForms(newForms);

    // Clear errors for this field
    if (errors[index]) {
      const newErrors = { ...errors };
      newErrors[index] = newErrors[index].filter(e => e.field !== field);
      if (newErrors[index].length === 0) {
        delete newErrors[index];
      }
      setErrors(newErrors);
    }
  };

  // Validate form
  const validateForm = (formData: UrlFormData): UrlValidationError[] => {
    const errors: UrlValidationError[] = [];

    // Validate URL
    if (!formData.originalUrl.trim()) {
      errors.push({ field: 'originalUrl', message: 'URL is required' });
    } else {
      try {
        new URL(formData.originalUrl);
      } catch {
        errors.push({ field: 'originalUrl', message: 'Please enter a valid URL (include http:// or https://)' });
      }
    }

    // Validate validity minutes
    if (formData.validityMinutes) {
      const minutes = parseInt(formData.validityMinutes);
      if (isNaN(minutes) || minutes < 1 || minutes > 525600) { // Max 1 year
        errors.push({ field: 'validityMinutes', message: 'Validity must be a number between 1 and 525600 minutes' });
      }
    }

    // Validate custom short code
    if (formData.customShortCode) {
      const regex = /^[A-Za-z0-9]{1,20}$/;
      if (!regex.test(formData.customShortCode)) {
        errors.push({ field: 'customShortCode', message: 'Short code must be alphanumeric (1-20 characters)' });
      }
    }

    return errors;
  };

  // Submit single form
  const submitForm = async (index: number) => {
    const formData = forms[index];
    const validationErrors = validateForm(formData);

    if (validationErrors.length > 0) {
      setErrors({ ...errors, [index]: validationErrors });
      logger.warn('Form validation failed', { index, errors: validationErrors }, 'UrlShortener');
      return;
    }

    setIsLoading({ ...isLoading, [index]: true });

    try {
      const result = urlService.createShortenedUrl({
        originalUrl: formData.originalUrl,
        validityMinutes: formData.validityMinutes ? parseInt(formData.validityMinutes) : undefined,
        customShortCode: formData.customShortCode || undefined
      });

      setResults(prev => [...prev, result]);
      
      // Clear the form
      updateForm(index, 'originalUrl', '');
      updateForm(index, 'customShortCode', '');
      
      toast({
        title: "URL Shortened Successfully!",
        description: `Short code: ${result.shortCode}`,
      });

      logger.info('URL shortened successfully', { 
        shortCode: result.shortCode, 
        originalUrl: formData.originalUrl 
      }, 'UrlShortener');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setErrors({ ...errors, [index]: [{ field: 'general', message: errorMessage }] });
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });

      logger.error('Failed to shorten URL', { error: errorMessage, formData }, 'UrlShortener');
    } finally {
      setIsLoading({ ...isLoading, [index]: false });
    }
  };

  // Submit all forms
  const submitAllForms = async () => {
    const validForms = forms
      .map((form, index) => ({ form, index }))
      .filter(({ form }) => form.originalUrl.trim());

    if (validForms.length === 0) {
      toast({
        title: "No URLs to shorten",
        description: "Please enter at least one URL",
        variant: "destructive"
      });
      return;
    }

    logger.info('Submitting multiple forms', { count: validForms.length }, 'UrlShortener');

    for (const { index } of validForms) {
      await submitForm(index);
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

  // Clear all results
  const clearResults = () => {
    setResults([]);
    logger.info('Results cleared', {}, 'UrlShortener');
  };

  const getShortUrl = (shortCode: string) => `${window.location.origin}/${shortCode}`;

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTimeUntilExpiry = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins <= 0) return 'Expired';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ${diffMins % 60}m`;
    return `${Math.floor(diffMins / 1440)}d ${Math.floor((diffMins % 1440) / 60)}h`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">URL Shortener</h1>
        <p className="text-muted-foreground">
          Shorten up to 5 URLs at once with custom codes and expiry times
        </p>
      </div>

      {/* URL Forms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Shorten URLs
          </CardTitle>
          <CardDescription>
            Enter your long URLs below. Default validity is 30 minutes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {forms.map((form, index) => (
            <div key={index} className="space-y-4 p-4 border border-border rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">URL {index + 1}</h3>
                {forms.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeForm(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {errors[index]?.find(e => e.field === 'general') && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {errors[index].find(e => e.field === 'general')?.message}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor={`url-${index}`}>Original URL *</Label>
                  <Input
                    id={`url-${index}`}
                    placeholder="https://example.com/very-long-url"
                    value={form.originalUrl}
                    onChange={(e) => updateForm(index, 'originalUrl', e.target.value)}
                    className={errors[index]?.find(e => e.field === 'originalUrl') ? 'border-destructive' : ''}
                  />
                  {errors[index]?.find(e => e.field === 'originalUrl') && (
                    <p className="text-sm text-destructive">
                      {errors[index].find(e => e.field === 'originalUrl')?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`validity-${index}`}>Validity (minutes)</Label>
                  <Input
                    id={`validity-${index}`}
                    type="number"
                    placeholder="30"
                    value={form.validityMinutes}
                    onChange={(e) => updateForm(index, 'validityMinutes', e.target.value)}
                    className={errors[index]?.find(e => e.field === 'validityMinutes') ? 'border-destructive' : ''}
                  />
                  {errors[index]?.find(e => e.field === 'validityMinutes') && (
                    <p className="text-sm text-destructive">
                      {errors[index].find(e => e.field === 'validityMinutes')?.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`shortcode-${index}`}>Custom Short Code (optional)</Label>
                  <Input
                    id={`shortcode-${index}`}
                    placeholder="mycode123"
                    value={form.customShortCode}
                    onChange={(e) => updateForm(index, 'customShortCode', e.target.value)}
                    className={errors[index]?.find(e => e.field === 'customShortCode') ? 'border-destructive' : ''}
                  />
                  {errors[index]?.find(e => e.field === 'customShortCode') && (
                    <p className="text-sm text-destructive">
                      {errors[index].find(e => e.field === 'customShortCode')?.message}
                    </p>
                  )}
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={() => submitForm(index)}
                    disabled={isLoading[index] || !form.originalUrl.trim()}
                    className="w-full"
                  >
                    {isLoading[index] ? 'Shortening...' : 'Shorten This URL'}
                  </Button>
                </div>
              </div>
            </div>
          ))}

          <div className="flex gap-2">
            {forms.length < 5 && (
              <Button variant="outline" onClick={addForm}>
                Add Another URL
              </Button>
            )}
            {forms.some(f => f.originalUrl.trim()) && (
              <Button onClick={submitAllForms}>
                Shorten All URLs
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  Shortened URLs
                </CardTitle>
                <CardDescription>
                  Your shortened URLs are ready to use
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={clearResults}>
                Clear Results
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result) => (
                <div key={result.id} className="border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground">Original URL:</p>
                      <p className="font-mono text-sm break-all">{result.originalUrl}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Short URL:</p>
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-sm bg-muted px-2 py-1 rounded">
                          {getShortUrl(result.shortCode)}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(getShortUrl(result.shortCode), 'Short URL')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <Badge variant={result.isExpired ? "destructive" : "secondary"}>
                        {getTimeUntilExpiry(result.expiresAt)}
                      </Badge>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Created: {formatDateTime(result.createdAt)}</p>
                    <p>Expires: {formatDateTime(result.expiresAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UrlShortener;