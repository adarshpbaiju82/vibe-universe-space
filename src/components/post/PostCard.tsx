
import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Heart, MessageCircle, Share2, MoreHorizontal, X, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toggleLike, Post } from "@/services/dataService";
import { toast } from "sonner";
import Comments from "./Comments";
import { VideoPlayer } from "@/components/ui/video-player";

interface PostCardProps {
  post: Post;
  onPostUpdate?: (updatedPost: Post) => void;
}

const PostCard = ({ post, onPostUpdate }: PostCardProps) => {
  const [isLiking, setIsLiking] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  
  const handleLikeClick = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      const updatedPost = await toggleLike(post.id);
      if (onPostUpdate) {
        onPostUpdate(updatedPost);
      }
    } catch (error) {
      toast.error("Failed to update like status");
      console.error(error);
    } finally {
      setIsLiking(false);
    }
  };
  
  const handleShare = () => {
    setShowShareDialog(true);
  };
  
  const handleCloseShareDialog = () => {
    setShowShareDialog(false);
  };
  
  const handleHidePost = () => {
    setIsHidden(true);
    toast.success("Post hidden from your feed");
  };
  
  const handleUndoHide = () => {
    setIsHidden(false);
  };
  
  const formatTimestamp = (date: Date) => {
    return format(new Date(date), "MMM d");
  };
  
  // Format the post content to highlight mentions and hashtags
  const formatContent = (content: string) => {
    if (!content) return null;
    
    // Split by mentions and hashtags, preserving delimiters
    const parts = content.split(/(\s@\w+\s|\s#\w+\s|@\w+\s|#\w+\s|\s@\w+|\s#\w+|^@\w+\s|^#\w+\s|^@\w+|^#\w+)/).filter(Boolean);
    
    return parts.map((part, index) => {
      // Check for mentions
      const mentionMatch = part.match(/^@(\w+)$|^@(\w+)\s|\s@(\w+)$|\s@(\w+)\s/);
      if (mentionMatch) {
        const username = mentionMatch[1] || mentionMatch[2] || mentionMatch[3] || mentionMatch[4];
        const hasLeadingSpace = part.startsWith(' ');
        const hasTrailingSpace = part.endsWith(' ');
        
        return (
          <span key={index}>
            {hasLeadingSpace ? ' ' : ''}
            <Link 
              to={`/profile/${username}`}
              className="text-blue-500 hover:underline"
            >
              @{username}
            </Link>
            {hasTrailingSpace ? ' ' : ''}
          </span>
        );
      }
      
      // Check for hashtags
      const hashtagMatch = part.match(/^#(\w+)$|^#(\w+)\s|\s#(\w+)$|\s#(\w+)\s/);
      if (hashtagMatch) {
        const hashtag = hashtagMatch[1] || hashtagMatch[2] || hashtagMatch[3] || hashtagMatch[4];
        const hasLeadingSpace = part.startsWith(' ');
        const hasTrailingSpace = part.endsWith(' ');
        
        return (
          <span key={index}>
            {hasLeadingSpace ? ' ' : ''}
            <Link
              to={`/explore?hashtag=${hashtag}`}
              className="text-pink-500 hover:underline"
            >
              #{hashtag}
            </Link>
            {hasTrailingSpace ? ' ' : ''}
          </span>
        );
      }
      
      // Regular text
      return part;
    });
  };
  
  if (isHidden) {
    return (
      <Card className="mb-4 p-4 text-center">
        <p className="text-muted-foreground">Post hidden</p>
        <Button variant="link" size="sm" onClick={handleUndoHide}>
          Undo
        </Button>
      </Card>
    );
  }
  
  // Guard against missing user data
  if (!post.user || !post.user.name) {
    return (
      <Card className="mb-4 p-4 text-center">
        <p className="text-muted-foreground">Error loading post</p>
      </Card>
    );
  }
  
  return (
    <Card className="mb-4 overflow-hidden card-hover border-border">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <Link to={`/profile/${post.user.name}`} className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={post.user.avatar} alt={post.user.name} />
              <AvatarFallback>{post.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{post.user.name}</p>
              <p className="text-xs text-muted-foreground">{formatTimestamp(post.createdAt)}</p>
            </div>
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => toast.info("Save Post feature would go here")}>
                Save Post
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleHidePost}>
                Hide
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="mb-4">
          <p className="mb-3">{formatContent(post.content)}</p>
          
          {post.mediaUrl && post.mediaType === 'image' && (
            <div className="relative rounded-lg overflow-hidden mb-2 aspect-video bg-muted/30">
              <img 
                src={post.mediaUrl} 
                alt="Post content" 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}
          
          {post.mediaUrl && post.mediaType === 'video' && (
            <div className="rounded-lg overflow-hidden mb-2 aspect-video">
              <VideoPlayer 
                src={post.mediaUrl} 
                poster={post.mediaUrl} 
                className="w-full aspect-video"
              />
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="py-2 px-4 border-t border-border flex justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center space-x-2" 
          onClick={handleLikeClick}
          disabled={isLiking}
        >
          <Heart className={`h-4 w-4 ${post.likes > 0 ? 'fill-red-500 text-red-500' : ''}`} />
          <span>{post.likes}</span>
        </Button>
        
        <Button variant="ghost" size="sm" className="flex items-center space-x-2">
          <MessageCircle className="h-4 w-4" />
          <span>{post.comments}</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center space-x-2"
          onClick={handleShare}
        >
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </Button>
      </CardFooter>
      
      <div className="px-4 pb-4">
        <Comments postId={post.id} commentCount={post.comments} />
      </div>
      
      {/* Share Dialog */}
      <Dialog 
        open={showShareDialog} 
        onOpenChange={setShowShareDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Post</DialogTitle>
            <DialogDescription>
              Share this post with others
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="flex items-center gap-4">
              <div className="border rounded-md p-3 flex-1 bg-muted/50">
                <p className="text-sm truncate">{`https://vibeverse.com/post/${post.id}`}</p>
              </div>
              <Button onClick={() => {
                toast.success("Link copied to clipboard!");
                handleCloseShareDialog();
              }}>
                Copy Link
              </Button>
            </div>
            <div className="flex justify-around mt-4">
              <Button variant="outline" className="w-10 h-10 p-0 rounded-full" onClick={() => toast.info("Twitter share would go here")}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 5.8a8.4 8.4 0 0 1-2.4.7 4.2 4.2 0 0 0 1.9-2.4c-.9.5-1.8.9-2.8 1.1a4.2 4.2 0 0 0-7.2 3.9 12 12 0 0 1-8.7-4.4 4.2 4.2 0 0 0 1.3 5.6c-.7 0-1.4-.2-2-.5v.1c0 2 1.4 3.8 3.4 4.2-.4.1-.7.2-1.1.2-.3 0-.5 0-.8-.1a4.2 4.2 0 0 0 4 3 8.5 8.5 0 0 1-5.3 1.8c-.3 0-.7 0-1-.1a12 12 0 0 0 6.4 1.9c7.8 0 12-6.5 12-12v-.5A8.6 8.6 0 0 0 22 5.8z"></path>
                </svg>
              </Button>
              <Button variant="outline" className="w-10 h-10 p-0 rounded-full" onClick={() => toast.info("Facebook share would go here")}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 12c0-5.5-4.5-10-10-10S2 6.5 2 12c0 5 3.7 9.1 8.4 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7C18.3 21.1 22 17 22 12z"></path>
                </svg>
              </Button>
              <Button variant="outline" className="w-10 h-10 p-0 rounded-full" onClick={() => toast.info("Email share would go here")}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export const PostCardSkeleton = () => {
  return (
    <Card className="mb-4 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3 mb-4" />
          
          <Skeleton className="w-full h-64 rounded-lg" />
        </div>
      </CardContent>
      
      <CardFooter className="py-2 px-4 border-t border-border flex justify-between">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
      </CardFooter>
    </Card>
  );
};

export default PostCard;
