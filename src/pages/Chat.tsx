
import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { getUserChats, Chat } from "@/services/dataService";
import { useAuth } from "@/contexts/AuthContext";
import ChatList from "@/components/chat/ChatList";
import ChatMessages from "@/components/chat/ChatMessages";
import { Separator } from "@/components/ui/separator";

const ChatPage = () => {
  const { chatId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChatId, setActiveChatId] = useState<string | undefined>(chatId);
  
  useEffect(() => {
    const fetchChats = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const userChats = await getUserChats(user.id);
        setChats(userChats);
        
        // If no specific chat is selected, default to the first one
        if (!activeChatId && userChats.length > 0) {
          setActiveChatId(userChats[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch chats:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChats();
  }, [user]);
  
  // Update active chat when URL param changes
  useEffect(() => {
    if (chatId) {
      setActiveChatId(chatId);
    }
  }, [chatId]);
  
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }
  
  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-150px)] bg-background rounded-lg border overflow-hidden">
      <div className="flex h-full">
        {/* Chat list sidebar */}
        <div className="w-full sm:w-80 md:w-96 border-r">
          <ChatList 
            chats={chats} 
            loading={loading} 
            activeChatId={activeChatId}
            onChatSelect={(id) => setActiveChatId(id)}
          />
        </div>
        
        <div className="hidden sm:flex sm:flex-1 items-center justify-center">
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
      </div>
      
      {/* Mobile: Show messages when a chat is selected */}
      {activeChatId && (
        <div className="sm:hidden fixed inset-0 bg-background z-50 pt-16">
          <ChatMessages 
            chatId={activeChatId} 
            onBack={() => setActiveChatId(undefined)}
          />
        </div>
      )}
    </div>
  );
};

export default ChatPage;
