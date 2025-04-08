
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Reels from '@/components/reels/Reels';

const ReelsPage = () => {
  const [viewMode, setViewMode] = useState<'feed' | 'fullscreen'>('fullscreen');
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('vertical');
  
  // TikTok/Instagram style fullscreen vertical scrolling is the default
  if (viewMode === 'fullscreen') {
    return <Reels orientation="vertical" fullscreen={true} />;
  }
  
  // Original feed view with tabs for orientation
  return (
    <div className="container py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Reels</h1>
        
        <div className="flex items-center gap-4">
          <Tabs defaultValue="feed" onValueChange={(value) => setViewMode(value as 'feed' | 'fullscreen')}>
            <TabsList>
              <TabsTrigger value="feed">Feed View</TabsTrigger>
              <TabsTrigger value="fullscreen">Fullscreen</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Tabs defaultValue="vertical" onValueChange={(value) => setOrientation(value as 'horizontal' | 'vertical')}>
            <TabsList>
              <TabsTrigger value="horizontal">Horizontal</TabsTrigger>
              <TabsTrigger value="vertical">Vertical</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      <Reels orientation={orientation} />
    </div>
  );
};

export default ReelsPage;
