import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Check, X, Edit, Save } from 'lucide-react';
import { usersApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  department: string;
  status: 'active' | 'inactive';
  join_date: string;
  profile_picture?: string;
  phone?: string;
  manager?: string;
  salary?: number;
  notes?: string;
}

interface InlineEditUserProps {
  user: User;
  onUserUpdated: (updatedUser: User) => void;
  onCancel: () => void;
}

export const InlineEditUser: React.FC<InlineEditUserProps> = ({
  user,
  onUserUpdated,
  onCancel,
}) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    department: user.department,
    role: user.role,
    status: user.status,
    phone: user.phone || '',
    manager: user.manager || '',
    salary: user.salary || 0,
    notes: user.notes || '',
  });

  const [originalData, setOriginalData] = useState(formData);

  useEffect(() => {
    setFormData({
      name: user.name,
      email: user.email,
      department: user.department,
      role: user.role,
      status: user.status,
      phone: user.phone || '',
      manager: user.manager || '',
      salary: user.salary || 0,
      notes: user.notes || '',
    });
    setOriginalData({
      name: user.name,
      email: user.email,
      department: user.department,
      role: user.role,
      status: user.status,
      phone: user.phone || '',
      manager: user.manager || '',
      salary: user.salary || 0,
      notes: user.notes || '',
    });
  }, [user]);

  const hasChanges = () => {
    return Object.keys(formData).some(key => 
      formData[key as keyof typeof formData] !== originalData[key as keyof typeof originalData]
    );
  };

  const handleSave = async () => {
    if (!hasChanges()) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    try {
      const updatedUser = await usersApi.updateUser(user.id.toString(), formData);
      onUserUpdated(updatedUser);
      setIsEditing(false);
      toast({
        title: 'Success',
        description: 'User updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
    onCancel();
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
        <div className="flex items-center space-x-4 flex-1">
          <img
            src={user.profile_picture || '/placeholder.svg'}
            alt={user.name}
            className="w-10 h-10 rounded-lg object-cover"
          />
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Name"
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
            <Input
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Email"
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
            <Input
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              placeholder="Department"
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as 'admin' | 'user' })}>
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as 'active' | 'inactive' })}>
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Phone"
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleSave}
            disabled={isLoading || !hasChanges()}
            className="h-8 w-8 text-success hover:bg-success/10"
            title="Save changes"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleCancel}
            disabled={isLoading}
            className="h-8 w-8 text-destructive hover:bg-destructive/10"
            title="Cancel editing"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors border border-border">
      <div className="flex items-center space-x-4">
        <img
          src={user.profile_picture || '/placeholder.svg'}
          alt={user.name}
          className="w-10 h-10 rounded-lg object-cover"
        />
        <div>
          <div className="font-medium text-foreground">{user.name}</div>
          <div className="text-sm text-muted-foreground">{user.email}</div>
          <div className="text-xs text-muted-foreground">{user.department} • {user.role}</div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={handleEdit}
          className="h-8 w-8 text-primary hover:bg-primary/10"
          title="Edit user inline"
        >
          <Edit className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}; 