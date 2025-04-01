
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getNotifications, Notification } from "@/services/dataService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, MessageCircle, User, AtSign, Check } from "lucide-react";

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNotifications();
        setNotifications(data);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, []);
  
  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "like":
        return <Heart className="h-4 w-4 text-red-500" />;
      case "comment":
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case "follow":
        return <User className="h-4 w-4 text-green-500" />;
      case "mention":
        return <AtSign className="h-4 w-4 text-purple-500" />;
      default:
        return null;
    }
  };
  
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now.getTime() - notifDate.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHrs = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    if (diffMins < 60) {
      return `${diffMins}m`;
    } else if (diffHrs < 24) {
      return `${diffHrs}h`;
    } else {
      return `${diffDays}d`;
    }
  };
  
  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        
        <Button variant="ghost" size="sm" onClick={markAllRead}>
          <Check className="h-4 w-4 mr-2" />
          Mark all read
        </Button>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="mentions">Mentions</TabsTrigger>
          <TabsTrigger value="likes">Likes</TabsTrigger>
          <TabsTrigger value="follows">Follows</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <div className="space-y-2">
            {loading ? (
              // Loading skeletons
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4 rounded-lg bg-card">
                  <div className="flex items-start space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-8" />
                      </div>
                      <Skeleton className="h-4 w-full mt-2" />
                    </div>
                  </div>
                </div>
              ))
            ) : notifications.length > 0 ? (
              notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`p-4 rounded-lg flex items-start space-x-3 ${
                    notification.isRead ? 'bg-card' : 'bg-primary/5 border border-primary/10'
                  }`}
                >
                  <Avatar>
                    <AvatarImage src={notification.userAvatar} alt={notification.username} />
                    <AvatarFallback>{notification.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <span className="font-medium">{notification.username}</span>
                        <span className="mx-1 text-muted-foreground">{notification.content}</span>
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(notification.createdAt)}
                      </span>
                    </div>
                    
                    {notification.postId && (
                      <Link 
                        to={`/post/${notification.postId}`} 
                        className="mt-2 block p-2 rounded-md bg-muted/50 text-sm hover:bg-muted transition-colors"
                      >
                        View post
                      </Link>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">No notifications yet</p>
                <p className="mt-2 text-sm">When you get notifications, they'll show up here</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="mentions">
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No mentions yet</p>
          </div>
        </TabsContent>
        
        <TabsContent value="likes">
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No likes yet</p>
          </div>
        </TabsContent>
        
        <TabsContent value="follows">
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No new followers yet</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Notifications;
