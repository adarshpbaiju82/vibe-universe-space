import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MoreHorizontal, AtSign, Hash, Send } from "lucide-react";
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
  const [mentionPosition, setMentionPosition] = useState<{ top: number; left: number; bottom?: number } | null>(null);
  const [hashtagPosition, setHashtagPosition] = useState<{ top: number; left: number; bottom?: number } | null>(null);
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
  
  const commentThreads = comments.reduce((acc, comment) => {
    if (!comment.parentId) {
      acc[comment.id] = {
        comment,
        replies: []
      };
    } else {
      if (acc[comment.parentId]) {
        acc[comment.parentId].replies.push(comment);
      }
    }
    return acc;
  }, {} as Record<string, { comment: Comment, replies: Comment[] }>);
  
  const handleTextChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    setter: React.Dispatch<React.SetStateAction<string>>,
    textareaRef: React.RefObject<HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setter(value);
    
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
    
    // Create a mirror div to calculate text dimensions
    const mirror = document.createElement('div');
    mirror.style.position = 'absolute';
    mirror.style.left = '-9999px';
    mirror.style.top = '-9999px';
    mirror.style.width = `${rect.width}px`;
    mirror.style.font = style.font;
    mirror.style.whiteSpace = 'pre-wrap';
    mirror.style.wordWrap = 'break-word';
    mirror.style.padding = style.padding;
    mirror.style.border = style.border;
    document.body.appendChild(mirror);
    
    const textBeforeCursor = textarea.value.substring(0, position);
    mirror.textContent = textBeforeCursor;
    
    const mirrorRect = mirror.getBoundingClientRect();
    const lines = textBeforeCursor.split('\n');
    const currentLine = lines.length - 1;
    
    document.body.removeChild(mirror);
    
    return {
      top: rect.top + window.scrollY + (currentLine * lineHeight) + lineHeight,
      left: Math.min(rect.left + window.scrollX + (lines[currentLine].length * fontSize * 0.6), rect.right - 200),
      bottom: rect.bottom + window.scrollY
    };
  };
  
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
    
    const prefix = isHashtag ? '#' : '@';
    const newTextBeforeCursor = textBeforeCursor.replace(
      isHashtag ? /#\w*$/ : /@\w*$/,
      `${prefix}${text} `
    );
    
    contentSetter(newTextBeforeCursor + textAfterCursor);
    
    setMentionPosition(null);
    setHashtagPosition(null);
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursorPosition = newTextBeforeCursor.length;
        textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);
  };
  
  const formatContent = (content: string) => {
    if (!content) return null;
    
    const parts = content.split(/(\s@\w+\s|\s#\w+\s|@\w+\s|#\w+\s|\s@\w+|\s#\w+|^@\w+\s|^#\w+\s|^@\w+|^#\w+)/).filter(Boolean);
    
    return parts.map((part, index) => {
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
      
      return part;
    });
  };
  
  return (
    <div className="border-t border-border pt-4">
      <Button
        variant="ghost"
        size="sm"
        className="mb-4 text-sm font-medium"
        onClick={toggleComments}
      >
        {showComments ? "Hide" : "Show"} comments ({commentCount})
      </Button>
      
      {showComments && (
        <div className="space-y-4">
          {/* Add new comment */}
          {user && (
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex space-x-3">
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={user.avatar} alt={user.username} />
                  <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <div className="relative">
                    <Textarea
                      ref={newCommentRef}
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => handleTextChange(e, setNewComment, newCommentRef)}
                      className="min-h-[80px] resize-none border-border bg-background"
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
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-500 hover:text-blue-600"
                        onClick={() => {
                          if (newCommentRef.current) {
                            const start = newCommentRef.current.selectionStart;
                            const end = newCommentRef.current.selectionEnd;
                            const newContent = newComment.substring(0, start) + '@' + newComment.substring(end);
                            setNewComment(newContent);
                            
                            setTimeout(() => {
                              if (newCommentRef.current) {
                                newCommentRef.current.focus();
                                const newPosition = start + 1;
                                newCommentRef.current.setSelectionRange(newPosition, newPosition);
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
                          if (newCommentRef.current) {
                            const start = newCommentRef.current.selectionStart;
                            const end = newCommentRef.current.selectionEnd;
                            const newContent = newComment.substring(0, start) + '#' + newComment.substring(end);
                            setNewComment(newContent);
                            
                            setTimeout(() => {
                              if (newCommentRef.current) {
                                newCommentRef.current.focus();
                                const newPosition = start + 1;
                                newCommentRef.current.setSelectionRange(newPosition, newPosition);
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
                      size="sm"
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || submitting}
                      className="bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600"
                    >
                      {submitting ? (
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
            </div>
          )}
          
          {/* Comments list */}
          <div className="space-y-6">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-16 w-full rounded-lg" />
                  </div>
                </div>
              ))
            ) : comments.length > 0 ? (
              Object.values(commentThreads).map(({ comment, replies }) => (
                <div key={comment.id} className="space-y-4">
                  {/* Main comment */}
                  <div className="flex space-x-3">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={comment.userAvatar} alt={comment.username} />
                      <AvatarFallback>{comment.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-2">
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm">{comment.username}</span>
                            <span className="text-xs text-muted-foreground">
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
                          <div className="space-y-3">
                            <div className="relative">
                              <Textarea
                                ref={editCommentRef}
                                value={editContent}
                                onChange={(e) => handleTextChange(e, setEditContent, editCommentRef)}
                                className="min-h-[60px] resize-none"
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
                            </div>
                            
                            <div className="flex justify-end space-x-2">
                              <Button size="sm" variant="outline" onClick={cancelEdit}>
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
                          <p className="text-sm leading-relaxed">{formatContent(comment.content)}</p>
                        )}
                      </div>
                      
                      {replyToId === comment.id && (
                        <div className="ml-6 bg-muted/30 rounded-lg p-3">
                          <div className="space-y-3">
                            <div className="relative">
                              <Textarea
                                ref={replyCommentRef}
                                placeholder="Write a reply..."
                                value={replyContent}
                                onChange={(e) => handleTextChange(e, setReplyContent, replyCommentRef)}
                                className="min-h-[60px] resize-none"
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
                            </div>
                            
                            <div className="flex justify-end space-x-2">
                              <Button size="sm" variant="outline" onClick={cancelReply}>
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
                        </div>
                      )}
                      
                      {/* Replies */}
                      {replies.length > 0 && (
                        <div className="ml-6 space-y-3">
                          {replies.map(reply => (
                            <div key={reply.id} className="flex space-x-3">
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarImage src={reply.userAvatar} alt={reply.username} />
                                <AvatarFallback>{reply.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1">
                                <div className="bg-muted/30 rounded-lg p-3">
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center space-x-2">
                                      <span className="font-medium text-sm">{reply.username}</span>
                                      <span className="text-xs text-muted-foreground">
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
                                    <div className="space-y-3">
                                      <div className="relative">
                                        <Textarea
                                          ref={editCommentRef}
                                          value={editContent}
                                          onChange={(e) => handleTextChange(e, setEditContent, editCommentRef)}
                                          className="min-h-[60px] resize-none"
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
                                      </div>
                                      
                                      <div className="flex justify-end space-x-2">
                                        <Button size="sm" variant="outline" onClick={cancelEdit}>
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
                                    <p className="text-sm leading-relaxed">{formatContent(reply.content)}</p>
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
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">
                  No comments yet. Be the first to comment!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Comments;
