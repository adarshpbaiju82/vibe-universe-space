
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Reply, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { getComments, addComment, Comment } from "@/services/dataService";
import { Link } from "react-router-dom";
import { MentionSuggestions } from "./MentionSuggestions";
import { HashtagSuggestions } from "./HashtagSuggestions";

interface CommentsProps {
  postId: string;
  commentCount: number;
}

const Comments = ({ postId, commentCount }: CommentsProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  
  // For mentions and hashtags
  const [mentionQuery, setMentionQuery] = useState("");
  const [hashtagQuery, setHashtagQuery] = useState("");
  const [mentionPosition, setMentionPosition] = useState<{ top: number; left: number } | null>(null);
  const [hashtagPosition, setHashtagPosition] = useState<{ top: number; left: number } | null>(null);
  const newCommentRef = useRef<HTMLTextAreaElement>(null);
  const editCommentRef = useRef<HTMLTextAreaElement>(null);
  const replyCommentRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments]);

  const fetchComments = async () => {
    if (!showComments) return;
    
    setLoading(true);
    try {
      const data = await getComments(postId);
      setComments(data);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      toast.error("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddComment = async () => {
    if (!user || !newComment.trim()) return;
    
    setSubmitting(true);
    try {
      const comment = await addComment(
        postId,
        user.id,
        user.username,
        user.avatar,
        newComment
      );
      
      setComments([...comments, comment]);
      setNewComment("");
      toast.success("Comment added");
    } catch (error) {
      toast.error("Failed to add comment");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleEditComment = async (commentId: string, content: string) => {
    // In a real app, you'd call an API to update the comment
    // For this demo, we'll simply update it in the client
    setComments(
      comments.map(comment => 
        comment.id === commentId 
          ? { ...comment, content } 
          : comment
      )
    );
    toast.success("Comment updated");
    setEditingCommentId(null);
  };
  
  const handleReply = async (commentId: string, content: string) => {
    if (!user || !content.trim()) return;
    
    // In a real app, you'd call an API to save the reply
    // For this demo, we'll create a local reply
    const newReply: Comment = {
      id: `reply-${Math.random().toString(36).substring(2, 9)}`,
      postId,
      userId: user.id,
      username: user.username,
      userAvatar: user.avatar,
      content,
      likes: 0,
      createdAt: new Date(),
      parentId: commentId
    };
    
    setComments([...comments, newReply]);
    setReplyToId(null);
    setReplyContent("");
    toast.success("Reply added");
  };
  
  const formatTimestamp = (date: Date) => {
    return format(new Date(date), "MMM d, h:mm a");
  };
  
  const toggleComments = () => {
    setShowComments(!showComments);
  };
  
  const startEditing = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };
  
  const startReplying = (commentId: string) => {
    setReplyToId(commentId);
    setReplyContent("");
  };
  
  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditContent("");
  };
  
  const cancelReply = () => {
    setReplyToId(null);
    setReplyContent("");
  };
  
  // Group comments for threaded display (top-level comments and their replies)
  const commentThreads = comments.reduce((acc, comment) => {
    if (!comment.parentId) {
      // This is a top-level comment
      acc[comment.id] = {
        comment,
        replies: []
      };
    } else {
      // This is a reply
      if (acc[comment.parentId]) {
        acc[comment.parentId].replies.push(comment);
      }
    }
    return acc;
  }, {} as Record<string, { comment: Comment, replies: Comment[] }>);
  
  // Handle text changes for mentions and hashtags
  const handleTextChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    setter: React.Dispatch<React.SetStateAction<string>>,
    textareaRef: React.RefObject<HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setter(value);
    
    // Check for mentions (@) and hashtags (#)
    const selectionStart = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, selectionStart);
    
    // Reset positions
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
  
  // Gets cursor coordinates for suggestion positioning
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
  
  // Handle mention/hashtag selection
  const handleSuggestionSelect = (
    text: string, 
    isHashtag: boolean,
    textareaRef: React.RefObject<HTMLTextAreaElement>,
    contentState: string,
    contentSetter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (!textareaRef.current) return;
    
    const selectionStart = textareaRef.current.selectionStart;
    const textBeforeCursor = contentState.substring(0, selectionStart);
    const textAfterCursor = contentState.substring(selectionStart);
    
    // Replace the last @word or #word with the selection
    const prefix = isHashtag ? '#' : '@';
    const newTextBeforeCursor = textBeforeCursor.replace(
      isHashtag ? /#\w*$/ : /@\w*$/,
      `${prefix}${text} `
    );
    
    contentSetter(newTextBeforeCursor + textAfterCursor);
    
    // Reset positions
    setMentionPosition(null);
    setHashtagPosition(null);
    
    // Focus and place cursor after the inserted mention/hashtag
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursorPosition = newTextBeforeCursor.length;
        textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);
  };
  
  // Format content to highlight mentions and hashtags
  const formatContent = (content: string) => {
    if (!content) return null;
    
    // Split by mentions and hashtags, preserving delimiters
    const parts = content.split(/(\s@\w+\s|\s#\w+\s|@\w+\s|#\w+\s|\s@\w+|\s#\w+|^@\w+\s|^#\w+\s|^@\w+|^#\w+)/).filter(Boolean);
    
    return parts.map((part, index) => {
      // Check for mentions
      const mentionMatch = part.match(/^@(\w+)$|^@(\w+)\s|\s@(\w+)$|\s@(\w+)\s/);
      if (mentionMatch) {
        const username = mentionMatch[1] || mentionMatch[2] || mentionMatch[3] || mentionMatch[4];
        const hasLeadingSpace = part.startsWith(' ');
        const hasTrailingSpace = part.endsWith(' ');
        
        return (
          <span key={index}>
            {hasLeadingSpace ? ' ' : ''}
            <Link 
              to={`/profile/${username}`}
              className="text-blue-500 hover:underline"
            >
              @{username}
            </Link>
            {hasTrailingSpace ? ' ' : ''}
          </span>
        );
      }
      
      // Check for hashtags
      const hashtagMatch = part.match(/^#(\w+)$|^#(\w+)\s|\s#(\w+)$|\s#(\w+)\s/);
      if (hashtagMatch) {
        const hashtag = hashtagMatch[1] || hashtagMatch[2] || hashtagMatch[3] || hashtagMatch[4];
        const hasLeadingSpace = part.startsWith(' ');
        const hasTrailingSpace = part.endsWith(' ');
        
        return (
          <span key={index}>
            {hasLeadingSpace ? ' ' : ''}
            <Link
              to={`/explore?hashtag=${hashtag}`}
              className="text-pink-500 hover:underline"
            >
              #{hashtag}
            </Link>
            {hasTrailingSpace ? ' ' : ''}
          </span>
        );
      }
      
      // Regular text
      return part;
    });
  };
  
  return (
    <div className="mt-2">
      <Button
        variant="ghost"
        size="sm"
        className="mb-4 text-sm"
        onClick={toggleComments}
      >
        {showComments ? "Hide" : "Show"} comments ({commentCount})
      </Button>
      
      {showComments && (
        <>
          {/* Add new comment */}
          {user && (
            <div className="flex space-x-2 mb-4">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar} alt={user.username} />
                <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 relative">
                <Textarea
                  ref={newCommentRef}
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => handleTextChange(e, setNewComment, newCommentRef)}
                  className="min-h-[60px] text-sm mb-2 resize-none"
                />
                
                <MentionSuggestions
                  query={mentionQuery}
                  onSelect={(username) => handleSuggestionSelect(username, false, newCommentRef, newComment, setNewComment)}
                  position={mentionPosition}
                />
                
                <HashtagSuggestions
                  query={hashtagQuery}
                  onSelect={(hashtag) => handleSuggestionSelect(hashtag, true, newCommentRef, newComment, setNewComment)}
                  position={hashtagPosition}
                />
                
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || submitting}
                    className="vibe-button"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                        Posting...
                      </>
                    ) : "Post Comment"}
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Comments list */}
          <div className="space-y-4">
            {loading ? (
              // Display comment skeletons while loading
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex space-x-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))
            ) : comments.length > 0 ? (
              Object.values(commentThreads).map(({ comment, replies }) => (
                <div key={comment.id} className="comment-thread">
                  {/* Main comment */}
                  <div className="flex space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.userAvatar} alt={comment.username} />
                      <AvatarFallback>{comment.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="bg-muted p-2 rounded-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-medium text-sm">{comment.username}</span>
                            <span className="ml-2 text-xs text-muted-foreground">
                              {formatTimestamp(comment.createdAt)}
                            </span>
                          </div>
                          
                          {user && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                {user.id === comment.userId && (
                                  <DropdownMenuItem onClick={() => startEditing(comment)}>
                                    Edit
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => startReplying(comment.id)}>
                                  Reply
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toast.info("Report feature would go here")}>
                                  Report
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                        
                        {editingCommentId === comment.id ? (
                          <div className="relative">
                            <Textarea
                              ref={editCommentRef}
                              value={editContent}
                              onChange={(e) => handleTextChange(e, setEditContent, editCommentRef)}
                              className="min-h-[60px] text-sm my-2 resize-none"
                            />
                            
                            <MentionSuggestions
                              query={mentionQuery}
                              onSelect={(username) => handleSuggestionSelect(username, false, editCommentRef, editContent, setEditContent)}
                              position={mentionPosition}
                            />
                            
                            <HashtagSuggestions
                              query={hashtagQuery}
                              onSelect={(hashtag) => handleSuggestionSelect(hashtag, true, editCommentRef, editContent, setEditContent)}
                              position={hashtagPosition}
                            />
                            
                            <div className="flex justify-end space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelEdit}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleEditComment(comment.id, editContent)}
                                disabled={!editContent.trim()}
                              >
                                Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm">{formatContent(comment.content)}</p>
                        )}
                      </div>
                      
                      {replyToId === comment.id && (
                        <div className="mt-2 ml-6 relative">
                          <Textarea
                            ref={replyCommentRef}
                            placeholder="Write a reply..."
                            value={replyContent}
                            onChange={(e) => handleTextChange(e, setReplyContent, replyCommentRef)}
                            className="min-h-[60px] text-sm mb-2 resize-none"
                          />
                          
                          <MentionSuggestions
                            query={mentionQuery}
                            onSelect={(username) => handleSuggestionSelect(username, false, replyCommentRef, replyContent, setReplyContent)}
                            position={mentionPosition}
                          />
                          
                          <HashtagSuggestions
                            query={hashtagQuery}
                            onSelect={(hashtag) => handleSuggestionSelect(hashtag, true, replyCommentRef, replyContent, setReplyContent)}
                            position={hashtagPosition}
                          />
                          
                          <div className="flex justify-end space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelReply}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleReply(comment.id, replyContent)}
                              disabled={!replyContent.trim()}
                            >
                              Reply
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {/* Replies */}
                      {replies.length > 0 && (
                        <div className="ml-6 mt-2 space-y-3">
                          {replies.map(reply => (
                            <div key={reply.id} className="flex space-x-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={reply.userAvatar} alt={reply.username} />
                                <AvatarFallback>{reply.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1">
                                <div className="bg-muted p-2 rounded-md">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <span className="font-medium text-sm">{reply.username}</span>
                                      <span className="ml-2 text-xs text-muted-foreground">
                                        {formatTimestamp(reply.createdAt)}
                                      </span>
                                    </div>
                                    
                                    {user && (
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-6 w-6">
                                            <MoreHorizontal className="h-3 w-3" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-40">
                                          {user.id === reply.userId && (
                                            <DropdownMenuItem onClick={() => startEditing(reply)}>
                                              Edit
                                            </DropdownMenuItem>
                                          )}
                                          <DropdownMenuItem onClick={() => toast.info("Report feature would go here")}>
                                            Report
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    )}
                                  </div>
                                  
                                  {editingCommentId === reply.id ? (
                                    <div className="relative">
                                      <Textarea
                                        ref={editCommentRef}
                                        value={editContent}
                                        onChange={(e) => handleTextChange(e, setEditContent, editCommentRef)}
                                        className="min-h-[60px] text-sm my-2 resize-none"
                                      />
                                      
                                      <MentionSuggestions
                                        query={mentionQuery}
                                        onSelect={(username) => handleSuggestionSelect(username, false, editCommentRef, editContent, setEditContent)}
                                        position={mentionPosition}
                                      />
                                      
                                      <HashtagSuggestions
                                        query={hashtagQuery}
                                        onSelect={(hashtag) => handleSuggestionSelect(hashtag, true, editCommentRef, editContent, setEditContent)}
                                        position={hashtagPosition}
                                      />
                                      
                                      <div className="flex justify-end space-x-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={cancelEdit}
                                        >
                                          Cancel
                                        </Button>
                                        <Button
                                          size="sm"
                                          onClick={() => handleEditComment(reply.id, editContent)}
                                          disabled={!editContent.trim()}
                                        >
                                          Save
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-sm">{formatContent(reply.content)}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground text-sm py-4">
                No comments yet. Be the first to comment!
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Comments;
