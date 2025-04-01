
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getExploreTopics, ExploreTopic, getUserSuggestions, UserSuggestion, toggleFollow } from "@/services/dataService";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { toast } from "sonner";

const Explore = () => {
  const [topics, setTopics] = useState<ExploreTopic[]>([]);
  const [users, setUsers] = useState<UserSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [topicsData, usersData] = await Promise.all([
          getExploreTopics(),
          getUserSuggestions()
        ]);
        
        setTopics(topicsData);
        setUsers(usersData);
      } catch (error) {
        console.error("Failed to fetch explore data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleFollowToggle = async (userId: string) => {
    try {
      // First optimistically update UI
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isFollowing: !user.isFollowing } : user
      ));
      
      // Then make API call
      const result = await toggleFollow(userId);
      
      if (!result.success) {
        // Revert on failure
        setUsers(users);
        toast.error("Failed to update follow status");
      }
    } catch (error) {
      // Revert on error
      setUsers(users);
      toast.error("An error occurred. Please try again.");
      console.error("Error toggling follow:", error);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Explore</h1>
      
      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search topics, people, or posts"
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <Tabs defaultValue="foryou">
        <TabsList className="mb-6">
          <TabsTrigger value="foryou">For You</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="news">News</TabsTrigger>
          <TabsTrigger value="people">People</TabsTrigger>
        </TabsList>
        
        <TabsContent value="foryou">
          {/* Featured Topics */}
          <h2 className="font-medium text-lg mb-4">Featured Topics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {loading ? (
              // Loading skeletons
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <div className="aspect-video relative overflow-hidden rounded-t-lg">
                    <Skeleton className="absolute inset-0" />
                  </div>
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-24 mb-2" />
                    <Skeleton className="h-4 w-16" />
                  </CardContent>
                </Card>
              ))
            ) : (
              topics.map(topic => (
                <Card key={topic.id} className="overflow-hidden card-hover">
                  <div className="aspect-video relative overflow-hidden rounded-t-lg">
                    <img 
                      src={topic.image} 
                      alt={topic.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                      <div>
                        <h3 className="font-bold text-white text-lg">{topic.title}</h3>
                        <p className="text-white/90 text-sm">{topic.postCount.toLocaleString()} posts</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
          
          {/* People to Follow */}
          <h2 className="font-medium text-lg mb-4">People to Follow</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {loading ? (
              // Loading skeletons
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div>
                        <Skeleton className="h-5 w-20 mb-1" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full mb-3" />
                    <Skeleton className="h-8 w-20 mx-auto" />
                  </CardContent>
                </Card>
              ))
            ) : (
              users.map(user => (
                <Card key={user.id} className="card-hover">
                  <CardContent className="p-4">
                    <Link to={`/profile/${user.username}`} className="flex items-center space-x-3 mb-3">
                      <Avatar>
                        <AvatarImage src={user.avatar} alt={user.username} />
                        <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                      </div>
                    </Link>
                    
                    <p className="text-sm mb-3 line-clamp-2">{user.bio}</p>
                    
                    <Button
                      variant={user.isFollowing ? "outline" : "secondary"}
                      size="sm"
                      className="w-full"
                      onClick={() => handleFollowToggle(user.id)}
                    >
                      {user.isFollowing ? "Following" : "Follow"}
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="trending">
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">Trending content coming soon</p>
          </div>
        </TabsContent>
        
        <TabsContent value="news">
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">News section coming soon</p>
          </div>
        </TabsContent>
        
        <TabsContent value="people">
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">People discovery coming soon</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Explore;
