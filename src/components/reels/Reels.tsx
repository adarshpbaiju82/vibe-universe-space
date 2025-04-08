
import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import ReelCard from './ReelCard';

// Sample data for reels
const SAMPLE_REELS = [
  {
    id: '1',
    user: {
      username: 'cosmicvibe',
      avatar: 'https://i.pravatar.cc/150?img=1',
    },
    video: 'https://assets.mixkit.co/videos/preview/mixkit-woman-lying-in-a-bed-of-flowers-27213-large.mp4',
    description: 'Just vibing in the universe ✨ #cosmic #vibes',
    likes: 1234,
    comments: 56,
    shares: 12,
  },
  {
    id: '2',
    user: {
      username: 'stardust',
      avatar: 'https://i.pravatar.cc/150?img=2',
    },
    video: 'https://assets.mixkit.co/videos/preview/mixkit-city-traffic-on-a-rainy-night-8111-large.mp4',
    description: 'Late night city vibes 🌃 #nightlife #cityscape',
    likes: 2567,
    comments: 123,
    shares: 45,
  },
  {
    id: '3',
    user: {
      username: 'moonchild',
      avatar: 'https://i.pravatar.cc/150?img=3',
    },
    video: 'https://assets.mixkit.co/videos/preview/mixkit-desert-landscape-with-mountains-on-a-sunny-day-3246-large.mp4',
    description: 'Desert adventures 🏜️ #travel #nature',
    likes: 3421,
    comments: 89,
    shares: 67,
  },
  {
    id: '4',
    user: {
      username: 'oceanwave',
      avatar: 'https://i.pravatar.cc/150?img=4',
    },
    video: 'https://assets.mixkit.co/videos/preview/mixkit-surfer-in-the-water-with-his-board-1452-large.mp4',
    description: 'Catching waves all day 🌊 #surf #ocean',
    likes: 5678,
    comments: 234,
    shares: 78,
  },
  {
    id: '5',
    user: {
      username: 'forestspirit',
      avatar: 'https://i.pravatar.cc/150?img=5',
    },
    video: 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4',
    description: "Nature's beauty is unmatched 🌿 #forest #naturelovers",
    likes: 4321,
    comments: 112,
    shares: 56,
  },
];

interface ReelsProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  fullscreen?: boolean;
}

const Reels = ({ orientation = 'horizontal', className, fullscreen = false }: ReelsProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  
  // Scroll control functions
  const scrollLeft = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
  };
  
  const scrollRight = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
  };
  
  const scrollUp = () => {
    if (!scrollRef.current) return;
    if (currentReelIndex > 0) {
      setCurrentReelIndex(currentReelIndex - 1);
      scrollRef.current.scrollTo({ 
        top: (currentReelIndex - 1) * scrollRef.current.clientHeight, 
        behavior: 'smooth' 
      });
    }
  };
  
  const scrollDown = () => {
    if (!scrollRef.current) return;
    if (currentReelIndex < SAMPLE_REELS.length - 1) {
      setCurrentReelIndex(currentReelIndex + 1);
      scrollRef.current.scrollTo({ 
        top: (currentReelIndex + 1) * scrollRef.current.clientHeight, 
        behavior: 'smooth' 
      });
    }
  };

  // Snap scroll effect for vertically scrolling reels
  const handleScroll = () => {
    if (!scrollRef.current || orientation !== 'vertical' || !fullscreen) return;
    
    const container = scrollRef.current;
    const scrollTop = container.scrollTop;
    const reelHeight = container.clientHeight;
    
    // Determine which reel is most visible
    const reelIndex = Math.round(scrollTop / reelHeight);
    
    if (reelIndex !== currentReelIndex) {
      setCurrentReelIndex(reelIndex);
    }
  };
  
  // Render horizontal reels
  if (orientation === 'horizontal') {
    return (
      <div className={cn("relative w-full", className)}>
        <h2 className="text-2xl font-bold mb-4 text-white">Reels</h2>
        <div className="relative">
          <Button 
            variant="outline" 
            size="icon"
            className="absolute -left-4 top-1/2 z-10 transform -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm"
            onClick={scrollLeft}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <ScrollArea 
            ref={scrollRef}
            className="w-full overflow-x-auto pb-4"
          >
            <div className="flex space-x-4 py-4">
              {SAMPLE_REELS.map((reel) => (
                <ReelCard key={reel.id} reel={reel} className="w-[250px] flex-shrink-0" />
              ))}
            </div>
          </ScrollArea>
          
          <Button 
            variant="outline" 
            size="icon"
            className="absolute -right-4 top-1/2 z-10 transform -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm"
            onClick={scrollRight}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }
  
  // Render vertical reels (normal or fullscreen)
  return (
    <div className={cn(
      "relative w-full", 
      fullscreen ? "h-[100vh] fixed inset-0 z-50" : "h-[500px]",
      className
    )}>
      {!fullscreen && <h2 className="text-2xl font-bold mb-4 text-white">Reels</h2>}
      <div className="relative h-full">
        {!fullscreen && (
          <Button 
            variant="outline" 
            size="icon"
            className="absolute left-1/2 -top-4 z-10 transform -translate-x-1/2 rounded-full bg-background/80 backdrop-blur-sm rotate-90"
            onClick={scrollUp}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        
        <ScrollArea 
          ref={scrollRef}
          className={cn(
            "h-full w-full",
            fullscreen ? "snap-y snap-mandatory" : "overflow-y-auto"
          )}
          onScroll={handleScroll}
        >
          <div className={cn(
            fullscreen ? "h-full" : "space-y-4 px-4"
          )}>
            {SAMPLE_REELS.map((reel, index) => (
              <div 
                key={reel.id} 
                className={cn(
                  fullscreen ? "h-screen snap-start snap-always" : ""
                )}
              >
                <ReelCard 
                  reel={reel} 
                  orientation="vertical" 
                  fullscreen={fullscreen}
                  isActive={index === currentReelIndex}
                />
              </div>
            ))}
          </div>
        </ScrollArea>
        
        {!fullscreen && (
          <Button 
            variant="outline" 
            size="icon"
            className="absolute left-1/2 -bottom-4 z-10 transform -translate-x-1/2 rounded-full bg-background/80 backdrop-blur-sm rotate-90"
            onClick={scrollDown}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default Reels;
