
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getUserPosts, Post } from "@/services/dataService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import PostCard, { PostCardSkeleton } from "@/components/post/PostCard";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  // For demo purposes, we'll pretend we're viewing the logged in user's profile
  // In a real app, we'd fetch the user data based on the username parameter
  const viewedUser = currentUser;
  const isOwnProfile = true;
  
  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!viewedUser) return;
      
      try {
        const data = await getUserPosts(viewedUser.id);
        setPosts(data);
      } catch (error) {
        console.error("Failed to fetch user posts:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserPosts();
  }, [viewedUser]);
  
  const handlePostUpdate = (updatedPost: Post) => {
    setPosts(posts.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ));
  };
  
  if (!viewedUser) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold mb-4">User not found</h1>
        <p className="text-muted-foreground">The user you're looking for doesn't exist or is unavailable.</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="mb-6">
        {/* Cover Photo */}
        <div className="h-48 bg-gradient-to-r from-vibe-500 to-purple-500 rounded-lg relative mb-16">
          {isOwnProfile && (
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4"
              onClick={() => toast.info("Edit cover photo functionality would go here")}
            >
              <Pencil className="h-4 w-4 mr-1" />
              Edit Cover
            </Button>
          )}
          
          {/* Profile Picture */}
          <Avatar className="absolute -bottom-12 left-6 h-24 w-24 border-4 border-background">
            <AvatarImage src={viewedUser.avatar} alt={viewedUser.username} />
            <AvatarFallback className="text-2xl">{viewedUser.username.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>
        
        {/* Profile Info */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between px-6">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold">{viewedUser.name}</h1>
            <p className="text-muted-foreground">@{viewedUser.username}</p>
            
            {viewedUser.bio && (
              <p className="mt-2">{viewedUser.bio}</p>
            )}
            
            <div className="flex space-x-4 mt-3">
              <div>
                <span className="font-bold">{viewedUser.followerCount}</span>
                <span className="text-muted-foreground ml-1">Followers</span>
              </div>
              <div>
                <span className="font-bold">{viewedUser.followingCount}</span>
                <span className="text-muted-foreground ml-1">Following</span>
              </div>
            </div>
          </div>
          
          {isOwnProfile ? (
            <Button
              variant="outline" 
              onClick={() => toast.info("Edit profile functionality would go here")}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <Button
              className="vibe-button"
              onClick={() => toast.success("User followed!")}
            >
              Follow
            </Button>
          )}
        </div>
      </div>
      
      {/* Profile Content */}
      <div className="px-6">
        <Tabs defaultValue="posts">
          <TabsList className="mb-6">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="likes">Likes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts">
            {loading ? (
              // Show skeletons while loading
              Array.from({ length: 3 }).map((_, index) => (
                <PostCardSkeleton key={index} />
              ))
            ) : posts.length > 0 ? (
              posts.map(post => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  onPostUpdate={handlePostUpdate} 
                />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">No posts yet</p>
                {isOwnProfile && (
                  <p className="mt-2">Share your first post with the universe!</p>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="media">
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">Media gallery coming soon</p>
            </div>
          </TabsContent>
          
          <TabsContent value="likes">
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">Liked posts coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
