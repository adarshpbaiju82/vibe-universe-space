
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Heart, MessageCircle, Share, MoreVertical, Volume, VolumeX } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
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
  fullscreen?: boolean;
  isActive?: boolean;
}

const ReelCard = ({ 
  reel, 
  orientation = 'horizontal', 
  className, 
  fullscreen = false,
  isActive = false 
}: ReelCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Play/pause video based on isActive prop
  useEffect(() => {
    if (!videoRef.current) return;
    
    if (isActive) {
      videoRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(error => {
          console.error('Error playing video:', error);
        });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive]);
  
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
  
  const toggleMute = () => {
    if (!videoRef.current) return;
    
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(!isMuted);
  };
  
  // If fullscreen, use a different UI layout
  if (fullscreen) {
    return (
      <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-blue-600/30 via-purple-500/20 to-pink-500/30">
        <AspectRatio ratio={9/16} className="h-full mx-auto">
          <video 
            ref={videoRef}
            src={reel.video}
            className="h-full w-full object-cover"
            loop
            playsInline
            muted={isMuted}
            onClick={togglePlay}
          />
        </AspectRatio>
        
        {/* Video Controls Overlay */}
        <div className="absolute inset-0 flex flex-col justify-between p-4 text-white">
          {/* Top bar with user info */}
          <div className="flex items-center">
            <Avatar className="h-10 w-10 mr-2 border-2 border-white">
              <AvatarImage src={reel.user.avatar} />
              <AvatarFallback>{reel.user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="font-medium text-white text-shadow-sm">@{reel.user.username}</span>
          </div>
          
          {/* Center play button */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Button 
                variant="ghost" 
                size="icon"
                className="h-20 w-20 rounded-full bg-black/30 text-white hover:bg-black/50"
                onClick={togglePlay}
              >
                <Play className="h-12 w-12" />
              </Button>
            </div>
          )}
          
          {/* Bottom area with description and actions */}
          <div className="flex justify-between items-end">
            {/* Description */}
            <div className="max-w-[70%]">
              <p className="text-white text-shadow-sm mb-2">{reel.description}</p>
              <div className="flex space-x-4 text-sm">
                <span>{reel.likes.toLocaleString()} likes</span>
                <span>{reel.comments.toLocaleString()} comments</span>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex flex-col items-center space-y-6">
              <Button 
                variant="ghost" 
                size="icon"
                className={cn(
                  "rounded-full bg-black/30 text-white hover:bg-black/50",
                  isLiked && "text-red-500"
                )}
                onClick={toggleLike}
              >
                <Heart className="h-7 w-7" fill={isLiked ? "currentColor" : "none"} />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon"
                className="rounded-full bg-black/30 text-white hover:bg-black/50"
              >
                <MessageCircle className="h-7 w-7" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon"
                className="rounded-full bg-black/30 text-white hover:bg-black/50"
              >
                <Share className="h-7 w-7" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon"
                className="rounded-full bg-black/30 text-white hover:bg-black/50"
                onClick={toggleMute}
              >
                {isMuted ? (
                  <VolumeX className="h-7 w-7" />
                ) : (
                  <Volume className="h-7 w-7" />
                )}
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon"
                className="rounded-full bg-black/30 text-white hover:bg-black/50"
              >
                <MoreVertical className="h-7 w-7" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Regular card view
  return (
    <Card className={cn(
      "overflow-hidden",
      orientation === 'vertical' ? "w-full" : null,
      className
    )}>
      <div className="relative">
        <AspectRatio ratio={9/16}>
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
        </AspectRatio>
        
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
