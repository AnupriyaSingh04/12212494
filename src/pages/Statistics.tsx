import React from 'react';
import Navigation from '@/components/Navigation';
import UrlStatistics from '@/components/UrlStatistics';

const Statistics: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <UrlStatistics />
    </div>
  );
};

export default Statistics;