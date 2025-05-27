import { useState, useEffect, useRef } from "react";
import { getChatMessages, getUserChats, sendMessage, Message } from "@/services/dataService";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { 
  Send, 
  ArrowLeft, 
  Phone, 
  Video, 
  MoreVertical, 
  Image as ImageIcon,
  Smile,
  Paperclip,
  Mic,
  Camera,
  MapPin,
  Gift,
  File,
  X
} from "lucide-react";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ChatMessagesProps {
  chatId: string;
  onBack?: () => void;
}

const ChatMessages = ({ chatId, onBack }: ChatMessagesProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatPartner, setChatPartner] = useState<{ name: string; avatar: string; username: string } | null>(null);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  
  // Emoji list for quick access
  const emojis = [
    "😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊", "😇", "🙂",
    "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋",
    "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳",
    "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖",
    "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯",
    "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔",
    "👍", "👎", "👌", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉",
    "👆", "🖕", "👇", "☝️", "👋", "🤚", "🖐", "✋", "🖖", "👏",
    "🙌", "🤲", "🙏", "✍️", "💅", "🤳", "💪", "🦾", "🦿", "🦵"
  ];

  useEffect(() => {
    const fetchChatData = async () => {
      if (!chatId || !user) return;
      
      setLoading(true);
      try {
        const [chatMessages, userChats] = await Promise.all([
          getChatMessages(chatId),
          getUserChats(user.id)
        ]);
        
        setMessages(chatMessages);
        
        const currentChat = userChats.find(chat => chat.id === chatId);
        if (currentChat) {
          const partner = currentChat.participants.find(p => p.username !== 'you');
          if (partner) {
            setChatPartner({
              name: partner.name,
              avatar: partner.avatar,
              username: partner.username
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch chat data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChatData();
  }, [chatId, user]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = async () => {
    if ((!messageText.trim() && !selectedFile) || sending) return;
    
    setSending(true);
    try {
      let content = messageText;
      if (selectedFile) {
        content = selectedFile.type.startsWith('image/') 
          ? `📷 ${selectedFile.name}` 
          : `📄 ${selectedFile.name}`;
        if (messageText.trim()) {
          content = `${messageText}\n${content}`;
        }
      }
      
      const newMessage = await sendMessage(chatId, content);
      setMessages([...messages, newMessage]);
      setMessageText("");
      setSelectedFile(null);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };
  
  const formatMessageDate = (date: Date) => {
    return format(date, "h:mm a");
  };
  
  const groupMessagesByDate = () => {
    const groups: { date: string; messages: Message[] }[] = [];
    
    messages.forEach(message => {
      const messageDate = new Date(message.createdAt);
      const dateString = format(messageDate, "MMMM d, yyyy");
      
      const existingGroup = groups.find(group => group.date === dateString);
      if (existingGroup) {
        existingGroup.messages.push(message);
      } else {
        groups.push({
          date: dateString,
          messages: [message]
        });
      }
    });
    
    return groups;
  };

  const handleVoiceCall = () => {
    console.log("Voice call initiated");
  };

  const handleVideoCall = () => {
    console.log("Video call initiated");
  };

  const handleAttachFile = () => {
    fileInputRef.current?.click();
  };

  const handleSendImage = () => {
    console.log("Send image");
  };

  const handleSendLocation = () => {
    console.log("Send location");
  };

  const handleSendGift = () => {
    console.log("Send gift");
  };

  const handleVoiceMessage = () => {
    console.log("Record voice message");
  };

  const handleTakePhoto = () => {
    console.log("Take photo");
  };
  
  const messageGroups = groupMessagesByDate();
  
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Chat Header */}
      <div className="border-b p-3 flex items-center gap-3 bg-background">
        {isMobile && (
          <Button variant="ghost" size="icon" className="mr-1" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        
        {chatPartner ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar>
                  <AvatarImage src={chatPartner.avatar} alt={chatPartner.name} />
                  <AvatarFallback>{chatPartner.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-background rounded-full bg-green-500"></div>
              </div>
              
              <div>
                <h3 className="font-medium">{chatPartner.name}</h3>
                <div className="flex items-center text-xs text-green-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1"></span>
                  Online now
                </div>
              </div>
            </div>
            
            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="rounded-full" onClick={handleVoiceCall}>
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={handleVideoCall}>
                <Video className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View Profile</DropdownMenuItem>
                  <DropdownMenuItem>Search Messages</DropdownMenuItem>
                  <DropdownMenuItem>Mute Notifications</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">Block User</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ) : loading ? (
          <div className="flex items-center gap-3 w-full">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ) : null}
      </div>
      
      {/* Full Screen Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-background/95">
        {loading ? (
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <div className={`flex gap-2 max-w-[80%] ${i % 2 === 0 ? '' : 'flex-row-reverse'}`}>
                  {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />}
                  <div>
                    <Skeleton className={`h-${i % 3 === 0 ? '12' : '20'} w-64 rounded-2xl ${i % 2 === 0 ? 'rounded-tl-sm' : 'rounded-tr-sm'}`} />
                    <Skeleton className="h-3 w-16 mt-1 ml-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : messages.length > 0 ? (
          <>
            {messageGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="space-y-4">
                <div className="text-center">
                  <span className="text-xs bg-muted/50 px-3 py-1 rounded-full text-muted-foreground">
                    {group.date}
                  </span>
                </div>
                
                {group.messages.map((message, messageIndex) => {
                  const isCurrentUser = message.senderId === 'currentUser';
                  const showAvatar = !isCurrentUser && 
                    (messageIndex === 0 || 
                     group.messages[messageIndex - 1].senderId !== message.senderId);
                  
                  return (
                    <div 
                      key={message.id} 
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={cn(
                        "flex gap-2 max-w-[80%]",
                        isCurrentUser ? 'flex-row-reverse' : ''
                      )}>
                        {!isCurrentUser && showAvatar ? (
                          <Avatar className="h-8 w-8 mt-1">
                            <AvatarImage src={chatPartner?.avatar} alt={chatPartner?.name} />
                            <AvatarFallback>
                              {chatPartner?.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ) : !isCurrentUser ? (
                          <div className="w-8" />
                        ) : null}
                        
                        <div>
                          <div 
                            className={cn(
                              "rounded-2xl p-3 break-words",
                              isCurrentUser
                                ? "bg-vibe-500 text-white rounded-tr-sm"
                                : "bg-muted rounded-tl-sm"
                            )}
                          >
                            <p className="text-sm">{message.content}</p>
                          </div>
                          <p className={`text-xs mt-1 text-muted-foreground ${isCurrentUser ? 'text-right mr-1' : 'ml-1'}`}>
                            {formatMessageDate(new Date(message.createdAt))}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">No messages yet</h3>
              <p className="text-muted-foreground mt-1">
                Start the conversation by sending a message
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Message Input Area - Fixed at bottom */}
      {chatPartner && (
        <div className="p-4 border-t bg-background">
          {/* File Preview */}
          {selectedFile && (
            <div className="mb-3 p-3 bg-muted rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedFile.type.startsWith('image/') ? (
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <File className="h-5 w-5 text-muted-foreground" />
                )}
                <span className="text-sm font-medium">{selectedFile.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="flex items-end gap-2">
            {/* Attachment Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full h-10 w-10"
              onClick={handleAttachFile}
            >
              <Paperclip className="h-5 w-5 text-muted-foreground" />
            </Button>
            
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              accept="image/*,video/*,.pdf,.doc,.docx,.txt"
            />
            
            {/* Voice Message */}
            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
              <Mic className="h-5 w-5 text-muted-foreground" />
            </Button>
            
            {/* Text Input */}
            <div className="flex-1 relative">
              <Textarea
                placeholder="Type a message..."
                className="min-h-[50px] max-h-32 resize-none text-sm py-3 pr-12 rounded-xl"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              
              {/* Emoji Picker */}
              <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-2 top-2 h-8 w-8 rounded-full"
                  >
                    <Smile className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-2" align="end">
                  <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
                    {emojis.map((emoji, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-muted"
                        onClick={() => handleEmojiSelect(emoji)}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Send Button */}
            <Button
              className="rounded-full h-10 w-10 p-0 bg-vibe-500 hover:bg-vibe-600"
              disabled={(!messageText.trim() && !selectedFile) || sending}
              onClick={handleSendMessage}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessages;
