
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, Camera } from "lucide-react";

const Settings = () => {
  const { user } = useAuth();
  
  const [generalForm, setGeneralForm] = useState({
    name: user?.name || "",
    username: user?.username || "",
    bio: user?.bio || "",
    email: "user@example.com", // Mockup
    phone: "" // Mockup
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    newFollower: true,
    postLikes: true,
    comments: true,
    mentions: true
  });
  
  const [privacySettings, setPrivacySettings] = useState({
    privateAccount: false,
    showOnlineStatus: true,
    allowTagging: true,
    allowDirectMessages: true
  });
  
  const [isSaving, setIsSaving] = useState(false);
  
  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Profile updated successfully!");
    setIsSaving(false);
  };
  
  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Notification preferences updated!");
    setIsSaving(false);
  };
  
  const handlePrivacySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Privacy settings updated!");
    setIsSaving(false);
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your profile information and account details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGeneralSubmit} className="space-y-6">
                {/* Profile Picture */}
                <div className="flex flex-col items-center space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4 mb-6">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={user?.avatar} alt={user?.username} />
                      <AvatarFallback>{user?.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      className="absolute -right-2 -bottom-2 rounded-full"
                      type="button"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="text-center sm:text-left">
                    <h3 className="font-medium">Profile Picture</h3>
                    <p className="text-sm text-muted-foreground">
                      JPG, GIF or PNG. Max size 2MB.
                    </p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2"
                      type="button"
                    >
                      Change photo
                    </Button>
                  </div>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input
                      id="name"
                      value={generalForm.name}
                      onChange={(e) => setGeneralForm({ ...generalForm, name: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={generalForm.username}
                      onChange={(e) => setGeneralForm({ ...generalForm, username: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={generalForm.bio}
                    onChange={(e) => setGeneralForm({ ...generalForm, bio: e.target.value })}
                    rows={3}
                    placeholder="Tell the world a little about yourself"
                  />
                  <p className="text-xs text-muted-foreground">
                    Max 160 characters.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={generalForm.email}
                    onChange={(e) => setGeneralForm({ ...generalForm, email: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={generalForm.phone}
                    onChange={(e) => setGeneralForm({ ...generalForm, phone: e.target.value })}
                    placeholder="+1 (555) 555-5555"
                  />
                </div>
                
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose which notifications you'd like to receive
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleNotificationSubmit} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Delivery Methods</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="pushNotifications">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive push notifications in your browser
                      </p>
                    </div>
                    <Switch
                      id="pushNotifications"
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({ ...notificationSettings, pushNotifications: checked })
                      }
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Activity Notifications</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="newFollower">New Followers</Label>
                      <p className="text-sm text-muted-foreground">
                        When someone follows you
                      </p>
                    </div>
                    <Switch
                      id="newFollower"
                      checked={notificationSettings.newFollower}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({ ...notificationSettings, newFollower: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="postLikes">Post Likes</Label>
                      <p className="text-sm text-muted-foreground">
                        When someone likes your posts
                      </p>
                    </div>
                    <Switch
                      id="postLikes"
                      checked={notificationSettings.postLikes}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({ ...notificationSettings, postLikes: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="comments">Comments</Label>
                      <p className="text-sm text-muted-foreground">
                        When someone comments on your posts
                      </p>
                    </div>
                    <Switch
                      id="comments"
                      checked={notificationSettings.comments}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({ ...notificationSettings, comments: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="mentions">Mentions</Label>
                      <p className="text-sm text-muted-foreground">
                        When someone mentions you in a post or comment
                      </p>
                    </div>
                    <Switch
                      id="mentions"
                      checked={notificationSettings.mentions}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({ ...notificationSettings, mentions: checked })
                      }
                    />
                  </div>
                </div>
                
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : "Save Preferences"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>
                Control your account privacy and visibility
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePrivacySubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="privateAccount">Private Account</Label>
                      <p className="text-sm text-muted-foreground">
                        Only approved followers can see your posts
                      </p>
                    </div>
                    <Switch
                      id="privateAccount"
                      checked={privacySettings.privateAccount}
                      onCheckedChange={(checked) => 
                        setPrivacySettings({ ...privacySettings, privateAccount: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="showOnlineStatus">Show Online Status</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow others to see when you're online
                      </p>
                    </div>
                    <Switch
                      id="showOnlineStatus"
                      checked={privacySettings.showOnlineStatus}
                      onCheckedChange={(checked) => 
                        setPrivacySettings({ ...privacySettings, showOnlineStatus: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="allowTagging">Allow Tagging</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow others to tag you in posts and comments
                      </p>
                    </div>
                    <Switch
                      id="allowTagging"
                      checked={privacySettings.allowTagging}
                      onCheckedChange={(checked) => 
                        setPrivacySettings({ ...privacySettings, allowTagging: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="allowDirectMessages">Direct Messages</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow people to send you direct messages
                      </p>
                    </div>
                    <Switch
                      id="allowDirectMessages"
                      checked={privacySettings.allowDirectMessages}
                      onCheckedChange={(checked) => 
                        setPrivacySettings({ ...privacySettings, allowDirectMessages: checked })
                      }
                    />
                  </div>
                </div>
                
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Password</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Change your password to maintain account security
                  </p>
                  
                  <Button variant="outline">
                    Change Password
                  </Button>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Two-Factor Authentication</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add an extra layer of security to your account
                  </p>
                  
                  <Button variant="outline">
                    Set up 2FA
                  </Button>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Session Management</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    View and manage your active sessions
                  </p>
                  
                  <div className="p-4 rounded-md bg-muted/50 mb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Current Session</p>
                        <p className="text-sm text-muted-foreground">Chrome on Windows • IP: 192.168.1.1</p>
                      </div>
                      <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">
                        Active
                      </span>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="text-destructive">
                    Log out all other sessions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
