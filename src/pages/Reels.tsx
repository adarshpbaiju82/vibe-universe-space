
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Reels from '@/components/reels/Reels';

const ReelsPage = () => {
  const [viewMode, setViewMode] = useState<'feed' | 'fullscreen'>('fullscreen');
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('vertical');
  
  // TikTok/Instagram style fullscreen vertical scrolling is the default
  if (viewMode === 'fullscreen') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-400 to-pink-500">
        <Reels orientation="vertical" fullscreen={true} />
      </div>
    );
  }
  
  // Original feed view with tabs for orientation
  return (
    <div className="container py-6 bg-gradient-to-br from-blue-400 to-pink-400 min-h-screen">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Reels</h1>
        
        <div className="flex items-center gap-4">
          <Tabs defaultValue="feed" onValueChange={(value) => setViewMode(value as 'feed' | 'fullscreen')}>
            <TabsList className="bg-white/20 backdrop-blur-sm">
              <TabsTrigger value="feed" className="data-[state=active]:bg-white/30">Feed View</TabsTrigger>
              <TabsTrigger value="fullscreen" className="data-[state=active]:bg-white/30">Fullscreen</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Tabs defaultValue="vertical" onValueChange={(value) => setOrientation(value as 'horizontal' | 'vertical')}>
            <TabsList className="bg-white/20 backdrop-blur-sm">
              <TabsTrigger value="horizontal" className="data-[state=active]:bg-white/30">Horizontal</TabsTrigger>
              <TabsTrigger value="vertical" className="data-[state=active]:bg-white/30">Vertical</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      <Reels orientation={orientation} />
    </div>
  );
};

export default ReelsPage;
