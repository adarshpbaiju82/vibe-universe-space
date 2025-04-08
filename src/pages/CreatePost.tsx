
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon, VideoIcon, X, Loader2, ArrowLeft } from "lucide-react";
import { createPost } from "@/services/dataService";
import { toast } from "sonner";
import { MentionSuggestions } from "@/components/post/MentionSuggestions";
import { HashtagSuggestions } from "@/components/post/HashtagSuggestions";
import { Link } from "react-router-dom";

const CreatePost = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaPreview, setMediaPreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // For mentions and hashtags
  const [mentionQuery, setMentionQuery] = useState("");
  const [hashtagQuery, setHashtagQuery] = useState("");
  const [mentionPosition, setMentionPosition] = useState<{ top: number; left: number } | null>(null);
  const [hashtagPosition, setHashtagPosition] = useState<{ top: number; left: number } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  if (!user) return null;
  
  const handleMediaInput = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, we'd upload the file to a storage service
      const objectUrl = URL.createObjectURL(file);
      setMediaPreview(objectUrl);
      setMediaUrl(objectUrl);
      setMediaType(type);
    }
  };
  
  const removeMedia = () => {
    setMediaPreview("");
    setMediaUrl("");
    setMediaType(null);
  };
  
  const handleSubmit = async () => {
    if (!content.trim() && !mediaUrl) return;
    
    setIsSubmitting(true);
    try {
      const newPost = await createPost(
        content,
        mediaUrl,
        mediaType || undefined
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
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);
    
    // Check for mentions (@) and hashtags (#)
    const selectionStart = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, selectionStart);
    
    // Close both suggestion menus first
    setMentionPosition(null);
    setHashtagPosition(null);
    
    // Check for mentions
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    if (mentionMatch && !textBeforeCursor.match(/\S@\w*$/)) {
      const query = mentionMatch[1];
      setMentionQuery(query);
      
      if (textareaRef.current) {
        const cursorPosition = getCursorCoordinates(textareaRef.current, selectionStart);
        setMentionPosition(cursorPosition);
      }
    } else {
      setMentionQuery("");
    }
    
    // Check for hashtags
    const hashtagMatch = textBeforeCursor.match(/#(\w*)$/);
    if (hashtagMatch && !textBeforeCursor.match(/\S#\w*$/)) {
      const query = hashtagMatch[1];
      setHashtagQuery(query);
      
      if (textareaRef.current) {
        const cursorPosition = getCursorCoordinates(textareaRef.current, selectionStart);
        setHashtagPosition(cursorPosition);
      }
    } else {
      setHashtagQuery("");
    }
  };
  
  const getCursorCoordinates = (textarea: HTMLTextAreaElement, position: number) => {
    // Create a mirror element
    const mirror = document.createElement('div');
    
    // Copy the textarea's styling
    const style = window.getComputedStyle(textarea);
    Array.from(style).forEach(key => {
      mirror.style.setProperty(key, style.getPropertyValue(key));
    });
    
    // Set the mirror's fixed properties
    mirror.style.position = 'absolute';
    mirror.style.top = '0';
    mirror.style.left = '0';
    mirror.style.visibility = 'hidden';
    mirror.style.overflow = 'hidden';
    mirror.style.height = 'auto';
    mirror.style.whiteSpace = 'pre-wrap';
    mirror.style.wordBreak = 'break-word';
    
    document.body.appendChild(mirror);
    
    // Get the text up to the cursor
    const textBeforeCursor = textarea.value.substring(0, position);
    
    // Add text to the mirror
    mirror.textContent = textBeforeCursor;
    
    // Create and add a span to mark the cursor position
    const span = document.createElement('span');
    span.textContent = '|';
    mirror.appendChild(span);
    
    // Get the cursor coordinates relative to the mirror
    const spanRect = span.getBoundingClientRect();
    const textareaRect = textarea.getBoundingClientRect();
    
    // Clean up
    document.body.removeChild(mirror);
    
    // Return the coordinates
    return {
      top: Math.min(spanRect.top - textareaRect.top + textarea.scrollTop + span.offsetHeight, textarea.offsetHeight),
      left: spanRect.left - textareaRect.left + textarea.scrollLeft
    };
  };
  
  const handleMentionSelect = (username: string) => {
    if (!textareaRef.current) return;
    
    const selectionStart = textareaRef.current.selectionStart;
    const textBeforeCursor = content.substring(0, selectionStart);
    const textAfterCursor = content.substring(selectionStart);
    
    // Replace the last @word with @username
    const newTextBeforeCursor = textBeforeCursor.replace(/@\w*$/, `@${username} `);
    
    setContent(newTextBeforeCursor + textAfterCursor);
    setMentionPosition(null);
    
    // Focus and place cursor after the inserted mention
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursorPosition = newTextBeforeCursor.length;
        textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);
  };
  
  const handleHashtagSelect = (hashtag: string) => {
    if (!textareaRef.current) return;
    
    const selectionStart = textareaRef.current.selectionStart;
    const textBeforeCursor = content.substring(0, selectionStart);
    const textAfterCursor = content.substring(selectionStart);
    
    // Replace the last #word with #hashtag
    const newTextBeforeCursor = textBeforeCursor.replace(/#\w*$/, `#${hashtag} `);
    
    setContent(newTextBeforeCursor + textAfterCursor);
    setHashtagPosition(null);
    
    // Focus and place cursor after the inserted hashtag
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursorPosition = newTextBeforeCursor.length;
        textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);
  };
  
  // Format the content to highlight mentions and hashtags
  const formatContent = () => {
    const parts = content.split(/(@\w+|#\w+)/).map((part, index) => {
      if (part.startsWith('@')) {
        const username = part.substring(1);
        return (
          <Link 
            key={index}
            to={`/profile/${username}`}
            className="text-blue-500 hover:underline"
          >
            {part}
          </Link>
        );
      } else if (part.startsWith('#')) {
        const hashtag = part.substring(1);
        return (
          <Link
            key={index}
            to={`/explore?hashtag=${hashtag}`}
            className="text-pink-500 hover:underline"
          >
            {part}
          </Link>
        );
      }
      return part;
    });
    
    return parts;
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
        <div className="relative">
          <Textarea
            ref={textareaRef}
            placeholder="What's on your mind?"
            className="resize-none mb-3 focus-visible:ring-vibe-500 min-h-32"
            value={content}
            onChange={handleContentChange}
            rows={5}
          />
          
          <MentionSuggestions
            query={mentionQuery}
            onSelect={handleMentionSelect}
            position={mentionPosition}
          />
          
          <HashtagSuggestions
            query={hashtagQuery}
            onSelect={handleHashtagSelect}
            position={hashtagPosition}
          />
        </div>
        
        {mediaPreview && (
          <div className="relative mb-3 rounded-md overflow-hidden">
            {mediaType === "image" ? (
              <img 
                src={mediaPreview} 
                alt="Upload preview" 
                className="max-h-80 rounded-md object-contain bg-secondary w-full"
              />
            ) : (
              <video 
                src={mediaPreview} 
                className="max-h-80 rounded-md object-contain bg-secondary w-full"
                controls
              />
            )}
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-2 right-2 rounded-full opacity-80 hover:opacity-100"
              onClick={removeMedia}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <div className="flex justify-between items-center mt-4">
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground" 
              asChild
              disabled={!!mediaUrl}
            >
              <label>
                <ImageIcon className="h-4 w-4 mr-1" />
                <span>Image</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => handleMediaInput(e, "image")}
                  disabled={!!mediaUrl}
                />
              </label>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground" 
              asChild
              disabled={!!mediaUrl}
            >
              <label>
                <VideoIcon className="h-4 w-4 mr-1" />
                <span>Video</span>
                <input 
                  type="file" 
                  accept="video/*" 
                  className="hidden" 
                  onChange={(e) => handleMediaInput(e, "video")}
                  disabled={!!mediaUrl}
                />
              </label>
            </Button>
          </div>
          
          <Button 
            onClick={handleSubmit}
            className="bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white"
            disabled={isSubmitting || (!content.trim() && !mediaUrl)}
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
