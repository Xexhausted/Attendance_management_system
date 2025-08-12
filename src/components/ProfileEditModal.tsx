import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Building, MapPin, Mail, Clock, User as UserIcon, Camera, Save } from 'lucide-react';
import { usersApi, authApi } from '@/services/api';
import { toast } from '@/hooks/use-toast';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSave?: (updatedUser: any) => void;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    department: user?.department || '',
    phone: user?.phone || '',
    location: user?.location || '',
    joinDate: user?.join_date || '',
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC+5');

  React.useEffect(() => {
    setForm({
      name: user?.name || '',
      email: user?.email || '',
      department: user?.department || '',
      phone: user?.phone || '',
      location: user?.location || '',
      joinDate: user?.join_date || '',
    });
    setTimezone(user?.timezone || 'UTC+5');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }, [user, isOpen]);

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Update profile info
      const updatedUser = await usersApi.updateUser(user.id, form);
      // Change password if fields are filled
      if (currentPassword && newPassword && confirmPassword) {
        if (newPassword !== confirmPassword) {
          toast({ title: 'Error', description: 'New passwords do not match', variant: 'destructive' });
          setIsLoading(false);
          return;
        }
        await usersApi.changePassword(currentPassword, newPassword);
        toast({ title: 'Success', description: 'Password changed.' });
      }
      toast({ title: 'Success', description: 'Profile updated.' });
      if (onSave) onSave(updatedUser);
      onClose();
    } catch (error) {
      toast({ title: 'Error', description: (error as Error).message || 'Failed to update profile', variant: 'destructive' });
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-card border-border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-foreground">
            <UserIcon className="w-5 h-5 text-primary" />
            <span>Profile Information</span>
          </DialogTitle>
          <DialogDescription>
            Update your profile details and save changes. All fields are editable.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={user?.profile_picture}
                alt={user?.name}
                className="w-20 h-20 rounded-xl object-cover shadow-lg border-2 border-border"
              />
              <Button
                size="icon"
                variant="outline"
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-background border-border"
                onClick={() => toast({
                  title: 'Profile Picture',
                  description: 'Profile picture update feature coming soon!',
                  variant: 'default',
                })}
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{user?.name}</h3>
              <p className="text-sm text-muted-foreground">{user?.role} • {user?.department}</p>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground font-medium">Full Name</Label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  value={form.name}
                  onChange={e => handleChange('name', e.target.value)}
                  className="pl-10 bg-background border-border text-foreground"
                  placeholder="Enter your full name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={e => handleChange('email', e.target.value)}
                  className="pl-10 bg-background border-border text-foreground"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department" className="text-foreground font-medium">Department</Label>
              <div className="relative">
                <Building className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="department"
                  value={form.department}
                  onChange={e => handleChange('department', e.target.value)}
                  className="pl-10 bg-background border-border text-foreground"
                  placeholder="Enter your department"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="text-foreground font-medium">Location</Label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="location"
                  value={form.location}
                  onChange={e => handleChange('location', e.target.value)}
                  className="pl-10 bg-background border-border text-foreground"
                  placeholder="Enter your location"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="joinDate" className="text-foreground font-medium">Join Date</Label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="joinDate"
                  value={form.joinDate}
                  onChange={e => handleChange('joinDate', e.target.value)}
                  className="pl-10 bg-background border-border text-foreground"
                  placeholder="YYYY-MM-DD"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone" className="text-foreground font-medium">Timezone</Label>
              <Select
                value={timezone}
                onValueChange={setTimezone}
              >
                <SelectTrigger className="pl-10 bg-background border-border text-foreground">
                  <Clock className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  <SelectItem value="UTC+0">UTC+0 (London)</SelectItem>
                  <SelectItem value="UTC+1">UTC+1 (Paris)</SelectItem>
                  <SelectItem value="UTC+2">UTC+2 (Cairo)</SelectItem>
                  <SelectItem value="UTC+5">UTC+5 (Mumbai)</SelectItem>
                  <SelectItem value="UTC+5:45">UTC+5:45 (Nepal)</SelectItem>
                  <SelectItem value="UTC+8">UTC+8 (Beijing)</SelectItem>
                  <SelectItem value="UTC-5">UTC-5 (New York)</SelectItem>
                  <SelectItem value="UTC-8">UTC-8 (Los Angeles)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 