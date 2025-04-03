
import { useState } from "react";
import { Search } from "lucide-react";
import { Chat } from "@/services/dataService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatListProps {
  chats: Chat[];
  loading: boolean;
  activeChatId?: string;
  onChatSelect: (chatId: string) => void;
}

// List of suggested users to chat with when no chats exist
const suggestedUsers = [
  {
    id: "suggested-1",
    name: "Emma Johnson",
    username: "emmaj",
    avatar: "https://ui-avatars.com/api/?name=Emma+Johnson&background=random",
    lastSeen: new Date()
  },
  {
    id: "suggested-2",
    name: "Michael Chen",
    username: "mikechen",
    avatar: "https://ui-avatars.com/api/?name=Michael+Chen&background=random",
    lastSeen: new Date()
  },
  {
    id: "suggested-3",
    name: "Sofia Rodriguez",
    username: "sofia_r",
    avatar: "https://ui-avatars.com/api/?name=Sofia+Rodriguez&background=random",
    lastSeen: new Date()
  }
];

const ChatList = ({ chats, loading, activeChatId, onChatSelect }: ChatListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();
  
  const filteredChats = searchQuery 
    ? chats.filter(chat => 
        chat.participants.some(p => 
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.username.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : chats;
  
  const filteredSuggestions = searchQuery
    ? suggestedUsers.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : suggestedUsers;
  
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
      <div className="p-3 md:p-4 border-b">
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
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 p-3 md:p-4 border-b">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-4 w-10" />
            </div>
          ))
        ) : filteredChats.length > 0 ? (
          // Display actual chats
          filteredChats.map((chat) => {
            const otherUser = getOtherParticipant(chat);
            
            return (
              <div
                key={chat.id}
                className={`flex items-center gap-3 p-3 md:p-4 border-b cursor-pointer hover:bg-accent/50 transition-colors ${
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
          // Show suggested users when no chats exist
          <>
            <div className="p-3 border-b">
              <p className="text-sm font-medium text-muted-foreground">Suggested Chats</p>
            </div>
            {filteredSuggestions.map(user => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-3 md:p-4 border-b cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => onChatSelect(user.id)}
              >
                <Avatar>
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-foreground truncate">{user.name}</h3>
                  </div>
                  <div className="flex items-center text-xs text-green-500">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                    Online
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatList;
