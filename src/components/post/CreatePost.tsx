
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ImageIcon, VideoIcon, X, Loader2, AtSign, Hash, Send } from "lucide-react";
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
    
    const newItems: MediaInput[] = Array.from(files).map(file => ({
      type,
      url: URL.createObjectURL(file),
      file
    }));
    
    setMediaItems([...mediaItems, ...newItems]);
    e.target.value = '';
  };
  
  const removeMediaItem = (index: number) => {
    setMediaItems(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async () => {
    if (!content.trim() && mediaItems.length === 0) return;
    
    setIsSubmitting(true);
    try {
      const mainMedia = mediaItems.length > 0 ? mediaItems[0] : null;
      const additionalMedia = mediaItems.slice(1).map(item => ({
        type: item.type,
        url: item.url
      }));
      
      const newPost = await createPost(
        content,
        mainMedia?.url || "",
        mainMedia?.type || undefined
      );
      
      if (additionalMedia.length > 0) {
        // @ts-ignore - We're extending the Post type temporarily
        newPost.additionalMedia = additionalMedia;
      }
      
      if (onPostCreated) {
        onPostCreated(newPost);
      }
      
      toast.success("Post created successfully!");
      
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
    
    const selectionStart = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, selectionStart);
    
    setMentionPosition(null);
    setHashtagPosition(null);
    
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
    const rect = textarea.getBoundingClientRect();
    const style = window.getComputedStyle(textarea);
    const fontSize = parseInt(style.fontSize);
    const lineHeight = parseInt(style.lineHeight) || fontSize * 1.2;
    
    const lines = textarea.value.substring(0, position).split('\n');
    const currentLine = lines.length - 1;
    const charInLine = lines[lines.length - 1].length;
    
    return {
      top: rect.top + window.scrollY + (currentLine * lineHeight) + lineHeight,
      left: rect.left + window.scrollX + (charInLine * fontSize * 0.6)
    };
  };
  
  const handleMentionSelect = (username: string) => {
    if (!textareaRef.current) return;
    
    const selectionStart = textareaRef.current.selectionStart;
    const textBeforeCursor = content.substring(0, selectionStart);
    const textAfterCursor = content.substring(selectionStart);
    
    const newTextBeforeCursor = textBeforeCursor.replace(/@\w*$/, `@${username} `);
    
    setContent(newTextBeforeCursor + textAfterCursor);
    setMentionPosition(null);
    
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
    
    const newTextBeforeCursor = textBeforeCursor.replace(/#\w*$/, `#${hashtag} `);
    
    setContent(newTextBeforeCursor + textAfterCursor);
    setHashtagPosition(null);
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursorPosition = newTextBeforeCursor.length;
        textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);
  };
  
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex space-x-4">
          <Avatar className="h-12 w-12 flex-shrink-0">
            <AvatarImage src={user.avatar} alt={user.username} />
            <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-4">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                placeholder="What's on your mind?"
                className="resize-none border-border bg-background min-h-[100px]"
                value={content}
                onChange={handleContentChange}
                rows={4}
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
            
            {mediaItems.length > 0 && (
              <div className="bg-muted/30 rounded-lg p-3">
                <ScrollArea className="w-full pb-2">
                  <div className="flex gap-3 pb-2">
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
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-90 hover:opacity-100"
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
            
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground hover:text-foreground" 
                  asChild
                >
                  <label>
                    <ImageIcon className="h-4 w-4 mr-2" />
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
                  className="text-muted-foreground hover:text-foreground" 
                  asChild
                >
                  <label>
                    <VideoIcon className="h-4 w-4 mr-2" />
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
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-blue-500 hover:text-blue-600"
                  onClick={() => {
                    if (textareaRef.current) {
                      const start = textareaRef.current.selectionStart;
                      const end = textareaRef.current.selectionEnd;
                      const newContent = content.substring(0, start) + '@' + content.substring(end);
                      setContent(newContent);
                      
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
                  <AtSign className="h-4 w-4 mr-1" />
                  Mention
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-pink-500 hover:text-pink-600"
                  onClick={() => {
                    if (textareaRef.current) {
                      const start = textareaRef.current.selectionStart;
                      const end = textareaRef.current.selectionEnd;
                      const newContent = content.substring(0, start) + '#' + content.substring(end);
                      setContent(newContent);
                      
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
                  <Hash className="h-4 w-4 mr-1" />
                  Hashtag
                </Button>
              </div>
              
              <Button 
                onClick={handleSubmit}
                className="bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600"
                disabled={isSubmitting || (!content.trim() && mediaItems.length === 0)}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Post
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatePost;
