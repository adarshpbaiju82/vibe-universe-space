import { useState, useEffect, useRef } from "react";
import { getChatMessages, getUserChats, sendMessage, Message } from "@/services/dataService";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, Info } from "lucide-react";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
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
    if (!messageText.trim() || sending) return;
    
    setSending(true);
    try {
      const newMessage = await sendMessage(chatId, messageText);
      setMessages([...messages, newMessage]);
      setMessageText("");
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
  
  const messageGroups = groupMessagesByDate();
  
  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-3 md:p-4 flex items-center">
        {chatPartner ? (
          <div className="flex items-center">
            <Avatar className="mr-3 h-8 w-8 md:h-10 md:w-10">
              <AvatarImage src={chatPartner.avatar} alt={chatPartner.name} />
              <AvatarFallback>{chatPartner.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-sm md:text-base">{chatPartner.name}</h3>
              <p className="text-xs text-muted-foreground">@{chatPartner.username}</p>
              <div className="flex items-center text-xs text-green-500">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                Online
              </div>
            </div>
          </div>
        ) : loading ? (
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </div>
        ) : (
          <div className="flex items-center text-muted-foreground">
            <span>Select a Chat</span>
          </div>
        )}
        
        <div className="ml-auto">
          <Button variant="ghost" size="icon" title="Chat info">
            <Info className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4 md:space-y-6">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <div className={`flex gap-2 max-w-[85%] ${i % 2 === 0 ? '' : 'flex-row-reverse'}`}>
                  {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full" />}
                  <div>
                    <Skeleton className={`h-16 w-48 rounded-lg ${i % 2 === 0 ? 'rounded-tl-none' : 'rounded-tr-none'}`} />
                    <Skeleton className="h-3 w-12 mt-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : messages.length > 0 ? (
          <>
            {messageGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="space-y-3 md:space-y-4">
                <div className="text-center">
                  <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
                    {group.date}
                  </span>
                </div>
                
                {group.messages.map((message) => {
                  const isCurrentUser = message.senderId === 'currentUser';
                  
                  return (
                    <div 
                      key={message.id} 
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-2 max-w-[85%] ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                        {!isCurrentUser && (
                          <Avatar className="h-8 w-8 mt-1">
                            <AvatarImage src={chatPartner?.avatar} alt={chatPartner?.name} />
                            <AvatarFallback>
                              {chatPartner?.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div>
                          <div 
                            className={`rounded-lg p-3 ${
                              isCurrentUser
                                ? 'bg-vibe-500 text-white rounded-tr-none'
                                : 'bg-muted rounded-tl-none'
                            }`}
                          >
                            <p className="text-sm md:text-base">{message.content}</p>
                          </div>
                          <p className={`text-xs mt-1 text-muted-foreground ${isCurrentUser ? 'text-right' : ''}`}>
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
              <p className="text-muted-foreground">No messages yet</p>
              <p className="text-sm mt-1">Start the conversation by sending a message below</p>
            </div>
          </div>
        )}
      </div>
      
      {chatPartner && (
        <div className="p-3 md:p-4 border-t">
          <div className="flex items-end gap-2">
            <Textarea
              placeholder="Type a message..."
              className="min-h-[50px] md:min-h-[60px] resize-none text-sm md:text-base py-2"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button
              className="vibe-button h-9 w-9 md:h-10 md:w-10 p-0 rounded-full flex items-center justify-center"
              disabled={!messageText.trim() || sending}
              onClick={handleSendMessage}
            >
              <Send className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessages;
