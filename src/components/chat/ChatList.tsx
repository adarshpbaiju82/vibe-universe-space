import { useState, useMemo } from "react";
import { Search, UserPlus } from "lucide-react";
import { Chat } from "@/services/dataService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ChatListProps {
  chats: Chat[];
  loading: boolean;
  activeChatId?: string;
  onChatSelect: (chatId: string) => void;
}

const dummyUsers = [
  {
    id: "dummy-1",
    name: "Emma Johnson",
    username: "emmaj",
    avatar: "https://ui-avatars.com/api/?name=Emma+Johnson&background=random",
    lastSeen: new Date(),
    lastMessage: "Hey, how are you doing?",
    time: new Date(Date.now() - 1000 * 60 * 15),
    unread: 3
  },
  {
    id: "dummy-2",
    name: "Michael Chen",
    username: "mikechen",
    avatar: "https://ui-avatars.com/api/?name=Michael+Chen&background=random",
    lastSeen: new Date(),
    lastMessage: "Let's catch up this weekend!",
    time: new Date(Date.now() - 1000 * 60 * 60),
    unread: 0
  },
  {
    id: "dummy-3",
    name: "Sofia Rodriguez",
    username: "sofia_r",
    avatar: "https://ui-avatars.com/api/?name=Sofia+Rodriguez&background=random",
    lastSeen: new Date(),
    lastMessage: "Did you see the latest post?",
    time: new Date(Date.now() - 1000 * 60 * 60 * 3),
    unread: 1
  },
  {
    id: "dummy-4",
    name: "Alex Taylor",
    username: "alext",
    avatar: "https://ui-avatars.com/api/?name=Alex+Taylor&background=random",
    lastSeen: new Date(),
    lastMessage: "I'll send you the details soon",
    time: new Date(Date.now() - 1000 * 60 * 60 * 24),
    unread: 0
  },
  {
    id: "dummy-5",
    name: "Jessica Kim",
    username: "jessk",
    avatar: "https://ui-avatars.com/api/?name=Jessica+Kim&background=random",
    lastSeen: new Date(),
    lastMessage: "Thanks for your help yesterday!",
    time: new Date(Date.now() - 1000 * 60 * 60 * 48),
    unread: 0
  }
];

const ChatList = ({ chats, loading, activeChatId, onChatSelect }: ChatListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredItems = useMemo(() => {
    if (chats.length > 0) {
      return searchQuery 
        ? chats.filter(chat => 
            chat.participants.some(p => 
              p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.username.toLowerCase().includes(searchQuery.toLowerCase())
            )
          )
        : chats;
    }
    
    return searchQuery
      ? dummyUsers.filter(user =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.username.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : dummyUsers;
  }, [chats, searchQuery]);
  
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
      <div className="p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages"
            className="pl-10 bg-muted/50 border-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto divide-y divide-border">
        {loading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 p-3 md:p-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-4 w-10" />
            </div>
          ))
        ) : filteredItems.length > 0 ? (
          filteredItems.map((item) => {
            const isRealChat = 'participants' in item;
            const id = isRealChat ? item.id : item.id;
            const otherUser = isRealChat ? getOtherParticipant(item as Chat) : item;
            const lastMessage = isRealChat 
              ? (item as Chat).lastMessage 
              : (item as typeof dummyUsers[0]).lastMessage;
            const time = isRealChat 
              ? (item as Chat).updatedAt 
              : (item as typeof dummyUsers[0]).time;
            const unread = isRealChat 
              ? (item as Chat).unreadCount 
              : (item as typeof dummyUsers[0]).unread;
            
            return (
              <div
                key={id}
                className={cn(
                  "flex items-center gap-3 p-4 cursor-pointer transition-colors",
                  "hover:bg-accent/50",
                  activeChatId === id && "bg-accent"
                )}
                onClick={() => onChatSelect(id)}
              >
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
                    <AvatarFallback>{otherUser.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-background rounded-full bg-green-500"></div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-foreground truncate">{otherUser.name}</h3>
                    <span className={cn(
                      "text-xs whitespace-nowrap",
                      unread > 0 ? "text-foreground font-medium" : "text-muted-foreground"
                    )}>
                      {formatTime(time)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={cn(
                      "text-sm truncate",
                      unread > 0 ? "text-foreground font-medium" : "text-muted-foreground"
                    )}>
                      {lastMessage}
                    </p>
                    
                    {unread > 0 && (
                      <span className="ml-2 flex-shrink-0 bg-vibe-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">
                        {unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-4 text-center">
            <p className="text-muted-foreground">No conversations found</p>
            <Button variant="outline" className="mt-4">
              <UserPlus className="mr-2 h-4 w-4" />
              Find Friends
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
