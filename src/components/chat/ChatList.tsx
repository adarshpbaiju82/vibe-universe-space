
import { useState } from "react";
import { Search } from "lucide-react";
import { Chat } from "@/services/dataService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface ChatListProps {
  chats: Chat[];
  loading: boolean;
  activeChatId?: string;
  onChatSelect: (chatId: string) => void;
}

const ChatList = ({ chats, loading, activeChatId, onChatSelect }: ChatListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredChats = searchQuery 
    ? chats.filter(chat => 
        chat.participants.some(p => 
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.username.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : chats;
  
  const getOtherParticipant = (chat: Chat) => {
    return chat.participants.find(p => p.username !== 'you') || chat.participants[0];
  };
  
  const formatTime = (date: Date) => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === now.toDateString()) {
      return format(date, "h:mm a");
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return format(date, "MMM d");
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold mb-3">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages"
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          // Skeleton loading states
          Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 p-4 border-b">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-4 w-10" />
            </div>
          ))
        ) : filteredChats.length > 0 ? (
          filteredChats.map((chat) => {
            const otherUser = getOtherParticipant(chat);
            
            return (
              <div
                key={chat.id}
                className={`flex items-center gap-3 p-4 border-b cursor-pointer hover:bg-accent/50 transition-colors ${
                  activeChatId === chat.id ? "bg-accent" : ""
                }`}
                onClick={() => onChatSelect(chat.id)}
              >
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
                    <AvatarFallback>{otherUser.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  {chat.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-vibe-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-foreground truncate">{otherUser.name}</h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTime(chat.updatedAt)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No conversations found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
