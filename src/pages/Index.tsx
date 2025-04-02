
import { useState, useEffect } from "react";
import { getPosts, Post } from "@/services/dataService";
import PostCard, { PostCardSkeleton } from "@/components/post/PostCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setIsLoading(true);
        const fetchedPosts = await getPosts(5); // Just get 5 posts for demo
        setPosts(fetchedPosts);
      } catch (error) {
        console.error("Error loading posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, []);

  const handlePostUpdate = (updatedPost: Post) => {
    setPosts(posts.map(post => post.id === updatedPost.id ? updatedPost : post));
  };

  const navigateToCreate = () => {
    navigate("/create");
  };

  return (
    <div className="min-h-screen max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to VibeVerse</h1>
        <p className="text-xl text-gray-600 mb-6">Connect with the cosmic community!</p>
        <Button onClick={navigateToCreate} size="lg" className="vibe-button">
          Create Your First Post
        </Button>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">Recent Posts</h2>
        
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <PostCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="text-center p-8 border border-dashed rounded-lg">
                <p className="text-gray-500">No posts yet. Be the first to share!</p>
              </div>
            ) : (
              posts.map(post => (
                <PostCard key={post.id} post={post} onPostUpdate={handlePostUpdate} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
