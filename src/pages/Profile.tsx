
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';

const Profile = () => {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name,
          avatar
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Update local user state
      setUser({ ...user, name, avatar });
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container py-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your profile information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="flex flex-col items-center mb-6">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={avatar} />
                <AvatarFallback>{name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                </div>
                
                <div>
                  <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-1">
                    Avatar URL
                  </label>
                  <Input
                    id="avatar"
                    value={avatar || ''}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
                
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <Input
                    id="role"
                    value={user?.role || ''}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Contact admin to change role</p>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" onClick={handleUpdateProfile} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Profile;
