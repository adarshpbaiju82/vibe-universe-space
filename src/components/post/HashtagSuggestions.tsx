
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Hashtag {
  id: string;
  name: string;
  postCount: number;
}

interface HashtagSuggestionsProps {
  query: string;
  onSelect: (hashtag: string) => void;
  position: { top: number; left: number } | null;
}

// This is a mock function - in a real app, you'd fetch from your API
const fetchHashtags = async (query: string): Promise<Hashtag[]> => {
  // Simulate API call with mock data
  return [
    { id: "1", name: "vibes", postCount: 234 },
    { id: "2", name: "technology", postCount: 189 },
    { id: "3", name: "music", postCount: 567 },
    { id: "4", name: "travel", postCount: 321 },
    { id: "5", name: "food", postCount: 432 },
    { id: "6", name: "fashion", postCount: 276 },
    { id: "7", name: "photography", postCount: 198 },
    { id: "8", name: "art", postCount: 145 },
    { id: "9", name: "nature", postCount: 289 },
    { id: "10", name: "fitness", postCount: 312 },
  ].filter(tag => tag.name.toLowerCase().includes(query.toLowerCase()));
};

export const HashtagSuggestions = ({ query, onSelect, position }: HashtagSuggestionsProps) => {
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const loadHashtags = async () => {
      if (query.length === 0) {
        setHashtags([]);
        return;
      }
      
      setLoading(true);
      try {
        const fetchedHashtags = await fetchHashtags(query);
        setHashtags(fetchedHashtags);
        setSelectedIndex(0);
      } catch (error) {
        console.error("Error fetching hashtags:", error);
      } finally {
        setLoading(false);
      }
    };

    loadHashtags();
  }, [query]);

  if (!position || hashtags.length === 0) return null;

  return (
    <div 
      className="absolute z-50 w-64 rounded-md border border-input bg-popover shadow-md"
      style={{ 
        top: `${position.top + 20}px`, // Position below the cursor with a small offset
        left: `${position.left}px` 
      }}
    >
      <ScrollArea className="max-h-60">
        <div className="p-1">
          {loading ? (
            <div className="flex items-center justify-center p-2">
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : (
            hashtags.map((hashtag, index) => (
              <button
                key={hashtag.id}
                className={`flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm ${
                  index === selectedIndex ? "bg-accent text-accent-foreground" : ""
                }`}
                onClick={() => onSelect(hashtag.name)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <span className="font-medium">#{hashtag.name}</span>
                <span className="text-xs text-muted-foreground">{hashtag.postCount} posts</span>
              </button>
            ))
          )}
          {query.length > 0 && hashtags.length === 0 && (
            <button
              className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm"
              onClick={() => onSelect(query)}
            >
              <span className="font-medium">Create #{query}</span>
            </button>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
