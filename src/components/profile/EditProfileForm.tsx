
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { updateUserProfile } from "@/services/dataService";
import { toast } from "sonner";

interface EditProfileFormProps {
  onClose: () => void;
  onProfileUpdated: () => void;
}

const EditProfileForm = ({ onClose, onProfileUpdated }: EditProfileFormProps) => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar);
  const [newAvatar, setNewAvatar] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      setNewAvatar(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      // In a real app, we would upload the image to storage
      // and get back a URL to save with the profile
      
      // For this demo, we'll just simulate the update
      const success = await updateUserProfile(user.id, {
        name,
        bio,
        // In a real app, this would be the URL from the uploaded image
        avatar: avatarPreview
      });
      
      if (success) {
        toast.success("Profile updated successfully");
        onProfileUpdated();
        onClose();
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      toast.error("An error occurred while updating your profile");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="flex flex-col items-center">
            <div className="relative">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={avatarPreview} alt={user.username} />
                <AvatarFallback className="text-2xl">
                  {user.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="absolute bottom-0 right-0 rounded-full p-1"
                asChild
              >
                <label>
                  <Upload className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              @{user.username}
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your display name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell the world about yourself"
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};

export default EditProfileForm;
