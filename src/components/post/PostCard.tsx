
import { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toggleLike, Post } from "@/services/dataService";
import { toast } from "sonner";

interface PostCardProps {
  post: Post;
  onPostUpdate?: (updatedPost: Post) => void;
}

const PostCard = ({ post, onPostUpdate }: PostCardProps) => {
  const [isLiking, setIsLiking] = useState(false);
  
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
  
  const formatTimestamp = (date: Date) => {
    return format(new Date(date), "MMM d");
  };
  
  return (
    <Card className="mb-4 overflow-hidden card-hover border-border">
      <CardContent className="p-4">
        {/* Post Header */}
        <div className="flex justify-between items-start mb-3">
          <Link to={`/profile/${post.username}`} className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={post.userAvatar} alt={post.username} />
              <AvatarFallback>{post.username.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{post.username}</p>
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
              <DropdownMenuItem>Save Post</DropdownMenuItem>
              <DropdownMenuItem>Report</DropdownMenuItem>
              <DropdownMenuItem>Hide</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Post Content */}
        <div className="mb-4">
          <p className="mb-3">{post.content}</p>
          
          {post.image && (
            <div className="relative rounded-lg overflow-hidden mb-2 aspect-video bg-muted/30">
              <img 
                src={post.image} 
                alt="Post content" 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="py-2 px-4 border-t border-border flex justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          className={`flex items-center space-x-2 ${post.isLiked ? 'text-red-500' : ''}`} 
          onClick={handleLikeClick}
          disabled={isLiking}
        >
          <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-red-500' : ''}`} />
          <span>{post.likes}</span>
        </Button>
        
        <Button variant="ghost" size="sm" className="flex items-center space-x-2">
          <MessageCircle className="h-4 w-4" />
          <span>{post.comments}</span>
        </Button>
        
        <Button variant="ghost" size="sm" className="flex items-center space-x-2">
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export const PostCardSkeleton = () => {
  return (
    <Card className="mb-4 overflow-hidden">
      <CardContent className="p-4">
        {/* Skeleton Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
        
        {/* Skeleton Content */}
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
