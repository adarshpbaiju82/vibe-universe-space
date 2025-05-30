
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
}

interface MentionSuggestionsProps {
  query: string;
  onSelect: (username: string) => void;
  position: { top: number; left: number; bottom?: number } | null;
}

// This is a mock function - in a real app, you'd fetch from your API
const fetchUsers = async (query: string): Promise<User[]> => {
  // Simulate API call with mock data
  return [
    { id: "1", name: "Alex Johnson", username: "alex", avatar: "/placeholder.svg" },
    { id: "2", name: "Sam Wilson", username: "samw", avatar: "/placeholder.svg" },
    { id: "3", name: "Jamie Smith", username: "jamies", avatar: "/placeholder.svg" },
    { id: "4", name: "Taylor Swift", username: "taylor", avatar: "/placeholder.svg" },
    { id: "5", name: "Jordan Lee", username: "jordan", avatar: "/placeholder.svg" },
    { id: "6", name: "Casey Morgan", username: "casey", avatar: "/placeholder.svg" },
    { id: "7", name: "Riley Parker", username: "riley", avatar: "/placeholder.svg" },
    { id: "8", name: "Dakota Quinn", username: "dakota", avatar: "/placeholder.svg" },
    { id: "9", name: "Morgan Rivera", username: "morgan", avatar: "/placeholder.svg" },
    { id: "10", name: "Avery Sanchez", username: "avery", avatar: "/placeholder.svg" },
  ].filter(user => 
    user.username.toLowerCase().includes(query.toLowerCase()) || 
    user.name.toLowerCase().includes(query.toLowerCase())
  );
};

export const MentionSuggestions = ({ query, onSelect, position }: MentionSuggestionsProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const loadUsers = async () => {
      if (query.length === 0) {
        setUsers([]);
        return;
      }
      
      setLoading(true);
      try {
        const fetchedUsers = await fetchUsers(query);
        setUsers(fetchedUsers);
        setSelectedIndex(0);
      } catch (error) {
        console.error("Error fetching users for mention suggestions:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [query]);

  if (!position || users.length === 0) return null;

  // Check if there's enough space below, if not show above
  const suggestionHeight = 240; // max-h-60 = 240px
  const spaceBelow = window.innerHeight - position.top;
  const showAbove = spaceBelow < suggestionHeight && position.bottom !== undefined;
  
  const style = showAbove 
    ? { 
        bottom: `${window.innerHeight - (position.bottom || position.top)}px`,
        left: `${position.left}px` 
      }
    : { 
        top: `${position.top + 24}px`,
        left: `${position.left}px` 
      };

  return (
    <div 
      className="fixed z-50 w-80 rounded-lg border border-border bg-popover shadow-lg"
      style={style}
    >
      <ScrollArea className="max-h-60">
        <div className="p-2">
          {loading ? (
            <div className="flex items-center justify-center p-3">
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : (
            users.map((user, index) => (
              <button
                key={user.id}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  index === selectedIndex ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                }`}
                onClick={() => onSelect(user.username)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground">@{user.username}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
