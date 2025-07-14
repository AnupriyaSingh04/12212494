import React from 'react';
import Navigation from '@/components/Navigation';
import UrlShortener from '@/components/UrlShortener';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <UrlShortener />
    </div>
  );
};

export default Index;
