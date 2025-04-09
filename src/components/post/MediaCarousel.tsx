
import { useState } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { VideoPlayer } from "@/components/ui/video-player";

export interface MediaItem {
  type: 'image' | 'video';
  url: string;
}

interface MediaCarouselProps {
  mediaItems: MediaItem[];
}

export const MediaCarousel = ({ mediaItems }: MediaCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!mediaItems || mediaItems.length === 0) return null;

  // If there's only one media item, display it without carousel controls
  if (mediaItems.length === 1) {
    const item = mediaItems[0];
    return (
      <div className="rounded-lg overflow-hidden">
        <AspectRatio ratio={1/1}>
          {item.type === 'image' ? (
            <img 
              src={item.url} 
              alt="Post content" 
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <VideoPlayer 
              src={item.url} 
              poster={item.url} 
              className="w-full h-full object-cover"
            />
          )}
        </AspectRatio>
      </div>
    );
  }

  return (
    <Carousel 
      className="w-full" 
      opts={{ loop: true }}
      onSelect={(api) => {
        if (api) {
          setCurrentIndex(api.selectedScrollSnap());
        }
      }}
    >
      <CarouselContent>
        {mediaItems.map((item, index) => (
          <CarouselItem key={index}>
            <AspectRatio ratio={1/1}>
              {item.type === 'image' ? (
                <img 
                  src={item.url} 
                  alt={`Post media ${index + 1}`} 
                  className="w-full h-full object-cover rounded-md"
                  loading="lazy"
                />
              ) : (
                <VideoPlayer 
                  src={item.url} 
                  poster={item.url} 
                  className="w-full h-full object-cover rounded-md"
                />
              )}
            </AspectRatio>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2" />
      <CarouselNext className="right-2" />
      
      {/* Indicators */}
      <div className="flex justify-center gap-1 mt-2">
        {mediaItems.map((_, index) => (
          <div 
            key={index}
            className={`h-1.5 rounded-full transition-all ${
              currentIndex === index 
                ? "w-4 bg-primary" 
                : "w-1.5 bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    </Carousel>
  );
};
