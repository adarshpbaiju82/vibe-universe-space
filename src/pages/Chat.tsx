import { useState, useEffect } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { getUserChats, Chat } from "@/services/dataService";
import { useAuth } from "@/contexts/AuthContext";
import ChatList from "@/components/chat/ChatList";
import ChatMessages from "@/components/chat/ChatMessages";
import { ArrowLeft, Plus, MoreVertical, Home, Search, Settings, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const ChatPage = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChatId, setActiveChatId] = useState<string | undefined>(chatId);
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();
  
  useEffect(() => {
    const fetchChats = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const userChats = await getUserChats(user.id);
        setChats(userChats);
        
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

  const handleGoHome = () => {
    navigate("/");
  };

  const handleNewChat = () => {
    toast.info("New chat functionality would go here");
  };

  const handleCreateGroup = () => {
    toast.info("Create group functionality would go here");
  };

  const handleChatSettings = () => {
    toast.info("Chat settings would go here");
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
  
  const filteredChats = chats.filter(chat => 
    chat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.participants?.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  return (
    <div className="flex h-screen bg-background">
      {/* Left sidebar - Chat list - Fixed */}
      <div className={`${activeChatId && isMobile ? 'hidden' : 'w-full'} md:w-80 lg:w-96 border-r flex flex-col bg-background`}>
        {/* Header with navigation and actions */}
        <div className="p-4 border-b flex items-center justify-between bg-background">
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full"
              onClick={handleGoHome}
              title="Go to Home"
            >
              <Home className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Messages</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full"
              onClick={handleNewChat}
              title="New Chat"
            >
              <Plus className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background">
                <DropdownMenuItem onClick={handleCreateGroup}>
                  <Users className="h-4 w-4 mr-2" />
                  Create Group
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <Users className="h-4 w-4 mr-2" />
                  Manage Contacts
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleChatSettings}>
                  <Settings className="h-4 w-4 mr-2" />
                  Chat Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search bar */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Chat list - scrollable */}
        <div className="flex-1 overflow-y-auto">
          <ChatList 
            chats={filteredChats} 
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
              <p className="text-muted-foreground max-w-md mb-6">
                Choose a chat from the sidebar or start a new conversation with your friends
              </p>
              <div className="flex space-x-2">
                <Button onClick={handleNewChat} className="vibe-button">
                  <Plus className="h-4 w-4 mr-2" />
                  Start New Chat
                </Button>
                <Button variant="outline" onClick={handleGoHome}>
                  <Home className="h-4 w-4 mr-2" />
                  Go to Home
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatPage;
