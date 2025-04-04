
import { useState, useRef, useEffect } from "react";
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  SkipBack, SkipForward
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
}

export function VideoPlayer({ src, poster, className }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Check if fullscreen changed from outside our component
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };
    
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
    };
    
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);
  
  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    if (!isPlaying) return;
    
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [isPlaying, showControls]);
  
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };
  
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !video.muted;
    setIsMuted(!isMuted);
  };
  
  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    
    const newVolume = value[0];
    video.volume = newVolume;
    setVolume(newVolume);
    
    if (newVolume === 0) {
      video.muted = true;
      setIsMuted(true);
    } else if (isMuted) {
      video.muted = false;
      setIsMuted(false);
    }
  };
  
  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = value[0];
    setCurrentTime(value[0]);
  };
  
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  const handleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  };
  
  const skip = (amount: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime += amount;
  };
  
  return (
    <div 
      ref={containerRef}
      className={`relative rounded-md overflow-hidden bg-black ${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
      onMouseMove={() => setShowControls(true)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain"
        onClick={togglePlay}
        onDoubleClick={handleFullscreen}
      />
      
      {/* Video Controls */}
      <div 
        className={`absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent transition-opacity ${
          showControls ? 'opacity-100' : 'opacity-0'
        } ${isFullscreen ? 'p-4' : ''}`}
      >
        {/* Progress bar */}
        <div className="mb-2">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.01}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className={`${isFullscreen ? 'h-6 w-6' : 'h-5 w-5'}`} />
              ) : (
                <Play className={`${isFullscreen ? 'h-6 w-6' : 'h-5 w-5'}`} />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => skip(-10)}
            >
              <SkipBack className={`${isFullscreen ? 'h-6 w-6' : 'h-5 w-5'}`} />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => skip(10)}
            >
              <SkipForward className={`${isFullscreen ? 'h-6 w-6' : 'h-5 w-5'}`} />
            </Button>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={toggleMute}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className={`${isFullscreen ? 'h-6 w-6' : 'h-5 w-5'}`} />
                ) : (
                  <Volume2 className={`${isFullscreen ? 'h-6 w-6' : 'h-5 w-5'}`} />
                )}
              </Button>
              
              <Slider 
                value={[isMuted ? 0 : volume]}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                className={`${isFullscreen ? 'w-32' : 'w-20'}`}
              />
            </div>

            {isFullscreen && (
              <span className="text-sm text-white ml-2">
                {formatTime(currentTime)} / {formatTime(duration || 0)}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {!isFullscreen && (
              <span className="text-xs text-white">
                {formatTime(currentTime)} / {formatTime(duration || 0)}
              </span>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={handleFullscreen}
            >
              {isFullscreen ? (
                <Minimize className={`${isFullscreen ? 'h-6 w-6' : 'h-5 w-5'}`} />
              ) : (
                <Maximize className={`${isFullscreen ? 'h-6 w-6' : 'h-5 w-5'}`} />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Central Play/Pause Button when controls are hidden in fullscreen */}
      {isFullscreen && isPlaying && !showControls && (
        <div 
          className="absolute inset-0 flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
          onClick={togglePlay}
        >
          <div className="bg-black/40 rounded-full p-5">
            <Pause className="h-10 w-10 text-white" />
          </div>
        </div>
      )}
      
      {isFullscreen && !isPlaying && !showControls && (
        <div 
          className="absolute inset-0 flex items-center justify-center cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
          onClick={togglePlay}
        >
          <div className="bg-black/40 rounded-full p-5">
            <Play className="h-10 w-10 text-white" />
          </div>
        </div>
      )}
    </div>
  );
}
