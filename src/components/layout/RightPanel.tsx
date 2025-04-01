
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getUserSuggestions, UserSuggestion, toggleFollow } from "@/services/dataService";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const RightPanel = () => {
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const data = await getUserSuggestions();
        setSuggestions(data);
      } catch (error) {
        console.error("Failed to fetch user suggestions:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSuggestions();
  }, []);
  
  const handleFollowToggle = async (userId: string) => {
    try {
      // First optimistically update UI
      setSuggestions(suggestions.map(user => 
        user.id === userId ? { ...user, isFollowing: !user.isFollowing } : user
      ));
      
      // Then make API call
      const result = await toggleFollow(userId);
      
      if (!result.success) {
        // Revert on failure
        setSuggestions(suggestions);
        toast.error("Failed to update follow status");
      }
    } catch (error) {
      // Revert on error
      setSuggestions(suggestions);
      toast.error("An error occurred. Please try again.");
      console.error("Error toggling follow:", error);
    }
  };
  
  return (
    <div className="sticky top-6 space-y-6">
      {/* Who to follow */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-medium mb-4">Who to follow</h3>
          
          <div className="space-y-4">
            {loading ? (
              // Loading skeletons
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-20 rounded-full" />
                </div>
              ))
            ) : (
              suggestions.map(user => (
                <div key={user.id} className="flex items-center justify-between">
                  <Link to={`/profile/${user.username}`} className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={user.avatar} alt={user.username} />
                      <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                    </div>
                  </Link>
                  
                  <Button
                    variant={user.isFollowing ? "outline" : "secondary"}
                    size="sm"
                    onClick={() => handleFollowToggle(user.id)}
                  >
                    {user.isFollowing ? "Following" : "Follow"}
                  </Button>
                </div>
              ))
            )}
          </div>
          
          <Link to="/explore" className="block text-center text-sm text-primary mt-4">
            See more
          </Link>
        </CardContent>
      </Card>
      
      {/* Trending topics */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-medium mb-4">Trending</h3>
          
          <div className="space-y-3">
            {loading ? (
              // Loading skeletons
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))
            ) : (
              <>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Trending in Art</p>
                  <p className="font-medium">#DigitalArtist</p>
                  <p className="text-xs text-muted-foreground">1.2K posts</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Trending in Science</p>
                  <p className="font-medium">#CosmicEnergy</p>
                  <p className="text-xs text-muted-foreground">876 posts</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Trending in Photography</p>
                  <p className="font-medium">#UniverseCapture</p>
                  <p className="text-xs text-muted-foreground">542 posts</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Trending in Music</p>
                  <p className="font-medium">#CosmicSounds</p>
                  <p className="text-xs text-muted-foreground">389 posts</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* App info */}
      <div className="text-xs text-muted-foreground space-y-1 px-4">
        <div className="flex flex-wrap gap-x-2">
          <a href="#" className="hover:underline">About</a>
          <a href="#" className="hover:underline">Terms of Service</a>
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Cookies</a>
          <a href="#" className="hover:underline">Accessibility</a>
        </div>
        <p>© 2023 VibeUniverse</p>
      </div>
    </div>
  );
};

export default RightPanel;
