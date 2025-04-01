
import { useState, useEffect } from "react";
import { getPosts, Post } from "@/services/dataService";
import CreatePost from "@/components/post/CreatePost";
import PostCard, { PostCardSkeleton } from "@/components/post/PostCard";

const Home = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getPosts();
        setPosts(data);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, []);
  
  const handlePostCreated = (newPost: Post) => {
    setPosts([newPost, ...posts]);
  };
  
  const handlePostUpdate = (updatedPost: Post) => {
    setPosts(posts.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ));
  };
  
  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Home</h1>
      
      <CreatePost onPostCreated={handlePostCreated} />
      
      <div className="space-y-4">
        {loading ? (
          // Show skeletons while loading
          Array.from({ length: 3 }).map((_, index) => (
            <PostCardSkeleton key={index} />
          ))
        ) : (
          posts.map(post => (
            <PostCard 
              key={post.id} 
              post={post} 
              onPostUpdate={handlePostUpdate} 
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Home;
