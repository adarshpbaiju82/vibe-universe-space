
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ImageIcon, VideoIcon, X, Loader2, AtSign, Hash } from "lucide-react";
import { createPost, Post } from "@/services/dataService";
import { toast } from "sonner";
import { MentionSuggestions } from "./MentionSuggestions";
import { HashtagSuggestions } from "./HashtagSuggestions";
import { Link } from "react-router-dom";
import { MediaItem } from "./MediaCarousel";

interface MediaInput extends MediaItem {
  file: File;
}

interface CreatePostProps {
  onPostCreated?: (post: Post) => void;
}

const CreatePost = ({ onPostCreated }: CreatePostProps) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [mediaItems, setMediaItems] = useState<MediaInput[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // For mentions and hashtags
  const [mentionQuery, setMentionQuery] = useState("");
  const [hashtagQuery, setHashtagQuery] = useState("");
  const [mentionPosition, setMentionPosition] = useState<{ top: number; left: number } | null>(null);
  const [hashtagPosition, setHashtagPosition] = useState<{ top: number; left: number } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  if (!user) return null;
  
  const handleMediaInput = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Create new media items for each selected file
    const newItems: MediaInput[] = Array.from(files).map(file => ({
      type,
      url: URL.createObjectURL(file),
      file
    }));
    
    // Add new items to existing media
    setMediaItems([...mediaItems, ...newItems]);
    
    // Reset the input
    e.target.value = '';
  };
  
  const removeMediaItem = (index: number) => {
    setMediaItems(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async () => {
    if (!content.trim() && mediaItems.length === 0) return;
    
    setIsSubmitting(true);
    try {
      // In a real app with backend, we'd upload all media files to storage
      // For now, we'll just simulate it by using the first media as the main one
      const mainMedia = mediaItems.length > 0 ? mediaItems[0] : null;
      const additionalMedia = mediaItems.slice(1).map(item => ({
        type: item.type,
        url: item.url
      }));
      
      // Create a new post object with the appropriate media type
      const newPost = await createPost(
        content,
        mainMedia?.url || "",
        mainMedia?.type || undefined
      );
      
      // Simulate adding additional media to the post (in a real app, this would be handled by the backend)
      if (additionalMedia.length > 0) {
        // @ts-ignore - We're extending the Post type temporarily
        newPost.additionalMedia = additionalMedia;
      }
      
      if (onPostCreated) {
        onPostCreated(newPost);
      }
      
      toast.success("Post created successfully!");
      
      // Reset form
      setContent("");
      setMediaItems([]);
      
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
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex space-x-3">
          <Avatar>
            <AvatarImage src={user.avatar} alt={user.username} />
            <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              placeholder="What's on your mind?"
              className="resize-none mb-3 focus-visible:ring-vibe-500"
              value={content}
              onChange={handleContentChange}
              rows={3}
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
            
            {mediaItems.length > 0 && (
              <div className="mb-3">
                <ScrollArea className="w-full pb-2">
                  <div className="flex gap-2 pb-2">
                    {mediaItems.map((item, index) => (
                      <div key={index} className="relative h-24 w-24 flex-shrink-0">
                        <AspectRatio ratio={1/1} className="rounded-md overflow-hidden bg-muted">
                          {item.type === "image" ? (
                            <img 
                              src={item.url} 
                              alt={`Media preview ${index}`} 
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <video 
                              src={item.url} 
                              className="object-cover w-full h-full"
                            />
                          )}
                        </AspectRatio>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute top-1 right-1 h-5 w-5 rounded-full opacity-80 hover:opacity-100"
                          onClick={() => removeMediaItem(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground" 
                  asChild
                >
                  <label>
                    <ImageIcon className="h-4 w-4 mr-1" />
                    <span>Image</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleMediaInput(e, "image")}
                      multiple
                    />
                  </label>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground" 
                  asChild
                >
                  <label>
                    <VideoIcon className="h-4 w-4 mr-1" />
                    <span>Video</span>
                    <input 
                      type="file" 
                      accept="video/*" 
                      className="hidden" 
                      onChange={(e) => handleMediaInput(e, "video")}
                      multiple
                    />
                  </label>
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1 text-blue-500"
                  onClick={() => {
                    if (textareaRef.current) {
                      const start = textareaRef.current.selectionStart;
                      const end = textareaRef.current.selectionEnd;
                      const newContent = content.substring(0, start) + '@' + content.substring(end);
                      setContent(newContent);
                      
                      // Set focus and cursor position right after the @ symbol
                      setTimeout(() => {
                        if (textareaRef.current) {
                          textareaRef.current.focus();
                          const newPosition = start + 1;
                          textareaRef.current.setSelectionRange(newPosition, newPosition);
                        }
                      }, 0);
                    }
                  }}
                >
                  <AtSign className="h-4 w-4" />
                  <span>Mention</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1 text-pink-500"
                  onClick={() => {
                    if (textareaRef.current) {
                      const start = textareaRef.current.selectionStart;
                      const end = textareaRef.current.selectionEnd;
                      const newContent = content.substring(0, start) + '#' + content.substring(end);
                      setContent(newContent);
                      
                      // Set focus and cursor position right after the # symbol
                      setTimeout(() => {
                        if (textareaRef.current) {
                          textareaRef.current.focus();
                          const newPosition = start + 1;
                          textareaRef.current.setSelectionRange(newPosition, newPosition);
                        }
                      }, 0);
                    }
                  }}
                >
                  <Hash className="h-4 w-4" />
                  <span>Hashtag</span>
                </Button>
              </div>
              
              <Button 
                onClick={handleSubmit}
                className="vibe-button bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600"
                disabled={isSubmitting || (!content.trim() && mediaItems.length === 0)}
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
