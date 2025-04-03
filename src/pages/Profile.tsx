
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getUserPosts, getUserMedia, getUserLikes, Post } from "@/services/dataService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import PostCard, { PostCardSkeleton } from "@/components/post/PostCard";
import EditProfileForm from "@/components/profile/EditProfileForm";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Pencil, Share2 } from "lucide-react";

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [mediaItems, setMediaItems] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [likesLoading, setLikesLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  
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
  
  useEffect(() => {
    const fetchUserMedia = async () => {
      if (!viewedUser || activeTab !== "media") return;
      
      try {
        setMediaLoading(true);
        const data = await getUserMedia(viewedUser.id);
        setMediaItems(data);
      } catch (error) {
        console.error("Failed to fetch user media:", error);
      } finally {
        setMediaLoading(false);
      }
    };
    
    fetchUserMedia();
  }, [viewedUser, activeTab]);
  
  useEffect(() => {
    const fetchUserLikes = async () => {
      if (!viewedUser || activeTab !== "likes") return;
      
      try {
        setLikesLoading(true);
        const data = await getUserLikes(viewedUser.id);
        setLikedPosts(data);
      } catch (error) {
        console.error("Failed to fetch user likes:", error);
      } finally {
        setLikesLoading(false);
      }
    };
    
    fetchUserLikes();
  }, [viewedUser, activeTab]);
  
  const handlePostUpdate = (updatedPost: Post) => {
    setPosts(posts.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ));
  };
  
  const handleShareProfile = () => {
    // In a real app, this would open a share dialog or copy a link
    toast.success("Profile link copied to clipboard!");
  };
  
  const handleProfileUpdated = () => {
    // In a real app, we would refetch the user data
    toast.success("Profile updated successfully");
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
          
          <div className="flex space-x-2">
            <Button
              variant="outline" 
              size="sm"
              onClick={handleShareProfile}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            
            {isOwnProfile ? (
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(true)}
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
      </div>
      
      {/* Profile Content */}
      <div className="px-6">
        <Tabs defaultValue="posts" onValueChange={setActiveTab}>
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
            {mediaLoading ? (
              // Show skeletons while loading
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="aspect-square rounded-md" />
                ))}
              </div>
            ) : mediaItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mediaItems.map(media => (
                  <div key={media.id} className="relative group aspect-square rounded-md overflow-hidden">
                    {media.mediaType === 'image' ? (
                      <img 
                        src={media.mediaUrl} 
                        alt="" 
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="relative w-full h-full">
                        <img 
                          src={media.mediaUrl} 
                          alt="" 
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <div className="h-12 w-12 bg-black/70 rounded-full flex items-center justify-center">
                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <p className="text-white text-sm truncate">{media.content.substring(0, 60)}{media.content.length > 60 ? '...' : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">No media posts yet</p>
                {isOwnProfile && (
                  <p className="mt-2">Share your first photo or video with the universe!</p>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="likes">
            {likesLoading ? (
              // Show skeletons while loading
              Array.from({ length: 3 }).map((_, index) => (
                <PostCardSkeleton key={index} />
              ))
            ) : likedPosts.length > 0 ? (
              likedPosts.map(post => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  onPostUpdate={handlePostUpdate} 
                />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">No liked posts yet</p>
                {isOwnProfile && (
                  <p className="mt-2">Like some posts to see them here!</p>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Edit Profile Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-xl">
          <EditProfileForm 
            onClose={() => setShowEditDialog(false)}
            onProfileUpdated={handleProfileUpdated}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
