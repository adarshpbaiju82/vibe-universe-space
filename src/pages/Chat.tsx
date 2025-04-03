
import { useState, useEffect } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { getUserChats, Chat } from "@/services/dataService";
import { useAuth } from "@/contexts/AuthContext";
import ChatList from "@/components/chat/ChatList";
import ChatMessages from "@/components/chat/ChatMessages";
import { ArrowLeft, Plus, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
  
  // Mobile chat view with active chat
  if (isMobile && activeChatId) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <ChatMessages chatId={activeChatId} onBack={handleBackToList} />
      </div>
    );
  }
  
  return (
    <div className="flex h-[calc(100vh-64px)] md:h-[calc(100vh-150px)] bg-background rounded-lg overflow-hidden">
      {/* Left sidebar - Chat list */}
      <div className={`${activeChatId && isMobile ? 'hidden' : 'w-full'} md:w-80 lg:w-96 border-r flex flex-col`}>
        <div className="p-4 border-b flex items-center justify-between">
          <h1 className="text-xl font-bold">Messages</h1>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Plus className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ChatList 
            chats={chats} 
            loading={loading} 
            activeChatId={activeChatId}
            onChatSelect={handleChatSelect}
          />
        </div>
      </div>
      
      {/* Right side - Chat messages or empty state */}
      {(!isMobile || activeChatId) && (
        <div className={`${!activeChatId && isMobile ? 'hidden' : 'flex'} md:flex flex-1 flex-col bg-muted/10`}>
          {activeChatId ? (
            <ChatMessages chatId={activeChatId} onBack={handleBackToList} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <ArrowLeft className="h-8 w-8 text-primary rotate-45" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
              <p className="text-muted-foreground max-w-md">
                Choose a chat from the sidebar or start a new conversation with your friends
              </p>
              <Button className="mt-6 vibe-button">
                <Plus className="h-4 w-4 mr-2" />
                Start New Chat
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatPage;
