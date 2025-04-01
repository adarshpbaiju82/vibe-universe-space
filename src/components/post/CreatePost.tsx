
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon, X, Loader2 } from "lucide-react";
import { createPost, Post } from "@/services/dataService";
import { toast } from "sonner";

interface CreatePostProps {
  onPostCreated?: (post: Post) => void;
}

const CreatePost = ({ onPostCreated }: CreatePostProps) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (!user) return null;
  
  const handleImageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, we'd upload the file to a storage service
      // and get back a URL. For this demo, we'll use a URL constructor
      // to create an object URL for local preview.
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
      
      // In a real app, this would be the URL returned from the upload service
      setImageUrl(objectUrl);
    }
  };
  
  const removeImage = () => {
    setImagePreview("");
    setImageUrl("");
  };
  
  const handleSubmit = async () => {
    if (!content.trim() && !imageUrl) return;
    
    setIsSubmitting(true);
    try {
      const newPost = await createPost(
        user.id,
        user.username,
        user.avatar,
        content,
        imageUrl
      );
      
      if (onPostCreated) {
        onPostCreated(newPost);
      }
      
      toast.success("Post created successfully!");
      
      // Reset form
      setContent("");
      setImageUrl("");
      setImagePreview("");
      
    } catch (error) {
      toast.error("Failed to create post. Please try again.");
      console.error("Error creating post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex space-x-3">
          <Avatar>
            <AvatarImage src={user.avatar} alt={user.username} />
            <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <Textarea
              placeholder="What's on your mind?"
              className="resize-none mb-3 focus-visible:ring-vibe-500"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
            />
            
            {imagePreview && (
              <div className="relative mb-3 rounded-md overflow-hidden">
                <img 
                  src={imagePreview} 
                  alt="Upload preview" 
                  className="max-h-60 rounded-md object-contain bg-secondary w-full"
                />
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 right-2 rounded-full opacity-80 hover:opacity-100"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
                  <label>
                    <ImageIcon className="h-4 w-4 mr-1" />
                    <span>Image</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageInput}
                    />
                  </label>
                </Button>
              </div>
              
              <Button 
                onClick={handleSubmit}
                className="vibe-button"
                disabled={isSubmitting || (!content.trim() && !imageUrl)}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : "Post"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatePost;
