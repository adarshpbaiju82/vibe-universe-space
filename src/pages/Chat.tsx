
import { useState, useEffect } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { getUserChats, Chat } from "@/services/dataService";
import { useAuth } from "@/contexts/AuthContext";
import ChatList from "@/components/chat/ChatList";
import ChatMessages from "@/components/chat/ChatMessages";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const ChatPage = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChatId, setActiveChatId] = useState<string | undefined>(chatId);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    const fetchChats = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const userChats = await getUserChats(user.id);
        setChats(userChats);
        
        // If we have a chatId from the URL, use it
        if (chatId) {
          setActiveChatId(chatId);
        } else if (userChats.length > 0 && !isMobile) {
          // Only on desktop, auto-select the first chat if no chat is selected
          setActiveChatId(userChats[0].id);
          navigate(`/chat/${userChats[0].id}`, { replace: true });
        }
      } catch (error) {
        console.error("Failed to fetch chats:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChats();
  }, [user, chatId]);
  
  const handleChatSelect = (id: string) => {
    setActiveChatId(id);
    navigate(`/chat/${id}`);
  };
  
  const handleBackToList = () => {
    setActiveChatId(undefined);
    navigate("/chat");
  };
  
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }
  
  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-64px)] md:h-[calc(100vh-150px)] bg-background rounded-lg border overflow-hidden">
      <div className="flex h-full">
        {/* Mobile: Use Sheet for chat list when in a chat */}
        {isMobile && activeChatId ? (
          <div className="w-full">
            <div className="flex items-center p-4 border-b">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[85%] sm:w-[385px] p-0">
                  <div className="h-full">
                    <ChatList 
                      chats={chats} 
                      loading={loading} 
                      activeChatId={activeChatId}
                      onChatSelect={handleChatSelect}
                    />
                  </div>
                </SheetContent>
              </Sheet>
              <h2 className="text-lg font-medium ml-2">Messages</h2>
            </div>
            <ChatMessages chatId={activeChatId} />
          </div>
        ) : (
          <>
            {/* Desktop: Side-by-side layout */}
            {!isMobile && (
              <div className="w-full sm:w-80 md:w-96 border-r">
                <ChatList 
                  chats={chats} 
                  loading={loading} 
                  activeChatId={activeChatId}
                  onChatSelect={handleChatSelect}
                />
              </div>
            )}
            
            {/* Mobile: Full-width chat list when no chat is selected */}
            {isMobile && !activeChatId && (
              <div className="w-full">
                <ChatList 
                  chats={chats} 
                  loading={loading} 
                  activeChatId={activeChatId}
                  onChatSelect={handleChatSelect}
                />
              </div>
            )}
            
            {/* Chat messages area */}
            <div className={`${isMobile ? 'hidden' : 'flex'} sm:flex sm:flex-1 items-center justify-center`}>
              {activeChatId ? (
                <ChatMessages chatId={activeChatId} />
              ) : (
                <div className="text-center p-8">
                  <h3 className="text-lg font-medium">Select a conversation</h3>
                  <p className="text-muted-foreground mt-2">
                    Choose a chat from the sidebar to start messaging
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
