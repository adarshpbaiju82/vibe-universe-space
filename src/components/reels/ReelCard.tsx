
import React, { useState, useRef } from 'react';
import { Play, Pause, Heart, MessageCircle, Share, MoreVertical } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Reel {
  id: string;
  user: {
    username: string;
    avatar: string;
  };
  video: string;
  description: string;
  likes: number;
  comments: number;
  shares: number;
}

interface ReelCardProps {
  reel: Reel;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

const ReelCard = ({ reel, orientation = 'horizontal', className }: ReelCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };
  
  const toggleLike = () => {
    setIsLiked(!isLiked);
  };
  
  return (
    <Card className={cn(
      "overflow-hidden",
      orientation === 'vertical' ? "w-full" : null,
      className
    )}>
      <div className="relative">
        <div className="relative aspect-[9/16] w-full overflow-hidden">
          <video 
            ref={videoRef}
            src={reel.video}
            className="h-full w-full object-cover"
            loop
            playsInline
            muted
            onClick={togglePlay}
          />
          
          {!isPlaying && (
            <Button 
              variant="ghost" 
              size="icon"
              className="absolute inset-0 m-auto h-12 w-12 rounded-full bg-black/40 text-white hover:bg-black/60"
              onClick={togglePlay}
            >
              <Play className="h-6 w-6" />
            </Button>
          )}
        </div>
        
        {/* User info overlay */}
        <div className="absolute bottom-4 left-4 flex items-center">
          <Avatar className="h-8 w-8 mr-2 border-2 border-white">
            <AvatarImage src={reel.user.avatar} />
            <AvatarFallback>{reel.user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="font-medium text-white text-shadow">@{reel.user.username}</span>
        </div>
        
        {/* Actions overlay */}
        <div className="absolute bottom-4 right-4 flex flex-col items-center space-y-4">
          <Button 
            variant="ghost" 
            size="icon"
            className={cn(
              "rounded-full bg-black/30 text-white hover:bg-black/50",
              isLiked && "text-red-500"
            )}
            onClick={toggleLike}
          >
            <Heart className="h-5 w-5" fill={isLiked ? "currentColor" : "none"} />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full bg-black/30 text-white hover:bg-black/50"
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full bg-black/30 text-white hover:bg-black/50"
          >
            <Share className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full bg-black/30 text-white hover:bg-black/50"
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <CardContent className="p-4">
        <p className="text-sm line-clamp-2">{reel.description}</p>
        <div className="mt-2 flex space-x-4 text-xs text-muted-foreground">
          <span>{reel.likes.toLocaleString()} likes</span>
          <span>{reel.comments.toLocaleString()} comments</span>
          <span>{reel.shares.toLocaleString()} shares</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReelCard;
