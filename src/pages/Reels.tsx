
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Reels from '@/components/reels/Reels';

const ReelsPage = () => {
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('vertical');
  
  return (
    <div className="container py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Reels</h1>
        
        <Tabs defaultValue="vertical" onValueChange={(value) => setOrientation(value as 'horizontal' | 'vertical')}>
          <TabsList>
            <TabsTrigger value="horizontal">Horizontal</TabsTrigger>
            <TabsTrigger value="vertical">Vertical</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <Reels orientation={orientation} />
    </div>
  );
};

export default ReelsPage;
