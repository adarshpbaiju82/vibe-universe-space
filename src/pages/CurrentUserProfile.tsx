import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getUserPosts, getUserMedia, getUserLikes, Post } from "@/services/dataService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PostCard, { PostCardSkeleton } from "@/components/post/PostCard";
import EditProfileForm from "@/components/profile/EditProfileForm";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Pencil, Share2, Upload, Home } from "lucide-react";

const CurrentUserProfile = () => {
  const { user: currentUser } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [mediaItems, setMediaItems] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [likesLoading, setLikesLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCoverDialog, setShowCoverDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [coverImage, setCoverImage] = useState<string>("/api/placeholder/1200/300");
  
  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!currentUser) return;
      
      try {
        const data = await getUserPosts(currentUser.id);
        setPosts(data);
      } catch (error) {
        console.error("Failed to fetch user posts:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserPosts();
  }, [currentUser]);
  
  useEffect(() => {
    const fetchUserMedia = async () => {
      if (!currentUser || activeTab !== "media") return;
      
      try {
        setMediaLoading(true);
        const data = await getUserMedia(currentUser.id);
        setMediaItems(data);
      } catch (error) {
        console.error("Failed to fetch user media:", error);
      } finally {
        setMediaLoading(false);
      }
    };
    
    fetchUserMedia();
  }, [currentUser, activeTab]);
  
  useEffect(() => {
    const fetchUserLikes = async () => {
      if (!currentUser || activeTab !== "likes") return;
      
      try {
        setLikesLoading(true);
        const data = await getUserLikes(currentUser.id);
        setLikedPosts(data);
      } catch (error) {
        console.error("Failed to fetch user likes:", error);
      } finally {
        setLikesLoading(false);
      }
    };
    
    fetchUserLikes();
  }, [currentUser, activeTab]);
  
  const handlePostUpdate = (updatedPost: Post) => {
    setPosts(posts.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ));
  };
  
  const handleShareProfile = () => {
    toast.success("Profile link copied to clipboard!");
  };
  
  const handleProfileUpdated = () => {
    toast.success("Profile updated successfully");
  };
  
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setCoverImage(previewUrl);
      setShowCoverDialog(false);
      toast.success("Cover photo updated successfully!");
    }
  };

  const predefinedCovers = [
    "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=1200&h=300&fit=crop",
    "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1200&h=300&fit=crop", 
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=300&fit=crop",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&h=300&fit=crop",
    "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=1200&h=300&fit=crop"
  ];

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Please sign in to view your profile</h1>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="mb-6">
        {/* Cover Photo */}
        <div 
          className="h-48 rounded-lg relative mb-16 bg-cover bg-center"
          style={{ backgroundImage: `url(${coverImage})` }}
        >
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-4 right-4"
            onClick={() => setShowCoverDialog(true)}
          >
            <Pencil className="h-4 w-4 mr-1" />
            Edit Cover
          </Button>
          
          {/* Profile Picture */}
          <Avatar className="absolute -bottom-12 left-6 h-24 w-24 border-4 border-background">
            <AvatarImage src={currentUser?.avatar} alt={currentUser?.username} />
            <AvatarFallback className="text-2xl">{currentUser?.username.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>
        
        {/* Profile Info */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between px-6">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold">{currentUser.name}</h1>
            <p className="text-muted-foreground">@{currentUser.username}</p>
            
            {currentUser.bio && (
              <p className="mt-2">{currentUser.bio}</p>
            )}
            
            <div className="flex space-x-4 mt-3">
              <div>
                <span className="font-bold">{currentUser.followerCount}</span>
                <span className="text-muted-foreground ml-1">Followers</span>
              </div>
              <div>
                <span className="font-bold">{currentUser.followingCount}</span>
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
            
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(true)}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
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
                <p className="mt-2">Share your first post with the universe!</p>
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
                <p className="mt-2">Share your first photo or video with the universe!</p>
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
                <p className="mt-2">Like some posts to see them here!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Edit Cover Dialog */}
      <Dialog open={showCoverDialog} onOpenChange={setShowCoverDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Cover Photo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {predefinedCovers.map((cover, index) => (
                <div
                  key={index}
                  className="aspect-[4/1] bg-cover bg-center rounded-lg cursor-pointer border-2 border-transparent hover:border-primary transition-colors"
                  style={{ backgroundImage: `url(${cover})` }}
                  onClick={() => {
                    setCoverImage(cover);
                    setShowCoverDialog(false);
                    toast.success("Cover photo updated successfully!");
                  }}
                />
              ))}
            </div>
            <div className="text-center">
              <label className="cursor-pointer">
                <Button variant="outline" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Custom Image
                  </span>
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverImageChange}
                />
              </label>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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

export default CurrentUserProfile;
