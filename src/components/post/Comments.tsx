
import { useState, useEffect } from "react";
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
              <div className="flex-1">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[60px] text-sm mb-2 resize-none"
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
                          <div>
                            <Textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="min-h-[60px] text-sm my-2 resize-none"
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
                          <p className="text-sm">{comment.content}</p>
                        )}
                      </div>
                      
                      {replyToId === comment.id && (
                        <div className="mt-2 ml-6">
                          <Textarea
                            placeholder="Write a reply..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            className="min-h-[60px] text-sm mb-2 resize-none"
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
                                    <div>
                                      <Textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className="min-h-[60px] text-sm my-2 resize-none"
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
                                    <p className="text-sm">{reply.content}</p>
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
