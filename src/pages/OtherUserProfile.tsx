
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getUserPosts, getUserMedia, getUserLikes, Post } from "@/services/dataService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostCard, { PostCardSkeleton } from "@/components/post/PostCard";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Share2, MessageSquare } from "lucide-react";

const OtherUserProfile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  const [isFollowing, setIsFollowing] = useState(false);
  
  // Mock user data - in a real app, you'd fetch this based on username
  const viewedUser = {
    id: "user2",
    name: "John Doe",
    username: username || "johndoe",
    avatar: "/placeholder.svg",
    bio: "Digital creator and tech enthusiast",
    followerCount: 1234,
    followingCount: 567,
  };
  
  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        // In a real app, you'd use the viewed user's ID
        const data = await getUserPosts(viewedUser.id);
        setPosts(data);
      } catch (error) {
        console.error("Failed to fetch user posts:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserPosts();
  }, [viewedUser.id]);
  
  const handlePostUpdate = (updatedPost: Post) => {
    setPosts(posts.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ));
  };
  
  const handleShareProfile = () => {
    toast.success("Profile link copied to clipboard!");
  };
  
  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    toast.success(isFollowing ? "Unfollowed user" : "Following user!");
  };
  
  const handleMessage = () => {
    toast.info("Chat functionality would open here");
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="mb-6">
        {/* Cover Photo */}
        <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg relative mb-16">
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
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleMessage}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
            
            <Button
              className={isFollowing ? "bg-gray-500 hover:bg-gray-600" : "vibe-button"}
              onClick={handleFollowToggle}
            >
              {isFollowing ? "Following" : "Follow"}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Profile Content */}
      <div className="px-6">
        <Tabs defaultValue="posts" onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="posts">Posts</TabsTrigger>
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
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OtherUserProfile;
