
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon, X, Loader2, ArrowLeft } from "lucide-react";
import { createPost } from "@/services/dataService";
import { toast } from "sonner";

const CreatePost = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (!user) return null;
  
  const handleImageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, we'd upload the file to a storage service
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
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
      
      toast.success("Post created successfully!");
      navigate("/");
    } catch (error) {
      toast.error("Failed to create post. Please try again.");
      console.error("Error creating post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Create Post</h1>
      </div>
      
      <div className="bg-card border border-border rounded-lg p-4">
        <Textarea
          placeholder="What's on your mind?"
          className="resize-none mb-3 focus-visible:ring-vibe-500 min-h-32"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
        />
        
        {imagePreview && (
          <div className="relative mb-3 rounded-md overflow-hidden">
            <img 
              src={imagePreview} 
              alt="Upload preview" 
              className="max-h-80 rounded-md object-contain bg-secondary w-full"
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
        
        <div className="flex justify-between items-center mt-4">
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
  );
};

export default CreatePost;
