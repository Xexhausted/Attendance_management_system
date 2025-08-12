import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { usersApi } from '@/services/api';
import { 
  Trash2, 
  AlertTriangle, 
  UserX, 
  Shield,
  CheckCircle,
  X
} from 'lucide-react';

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onUserDeleted: (userId: string) => void;
}

export const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
  isOpen,
  onClose,
  user,
  onUserDeleted
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationStep, setConfirmationStep] = useState(1);
  const [confirmText, setConfirmText] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const handleClose = () => {
    setConfirmationStep(1);
    setConfirmText('');
    setAdminPassword('');
    onClose();
  };

  const handleDelete = async () => {
    if (confirmationStep < 3) {
      setConfirmationStep(confirmationStep + 1);
      return;
    }

    setIsLoading(true);
    try {
      const response = await usersApi.deleteUser(user.id);

      if (response.success) {
        toast({
          title: "User Deleted Successfully",
          description: `${user.name} has been permanently deleted from the system.`,
          variant: "default",
        });

        onUserDeleted(user.id);
        handleClose();
      } else {
        toast({
          title: "Failed to Delete User",
          description: response.message || "An error occurred while deleting the user.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderConfirmationStep = () => {
    switch (confirmationStep) {
      case 1:
        return (
          <div className="space-y-4">
            <Alert className="border-destructive bg-destructive/10">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive">
                <strong>Warning:</strong> This action cannot be undone. All user data, including attendance records, will be permanently deleted.
              </AlertDescription>
            </Alert>
            
            <div className="text-center space-y-2">
              <p className="text-foreground">Are you sure you want to delete this user?</p>
              <p className="text-lg font-semibold text-destructive">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => setConfirmationStep(2)}
                className="flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                Yes, Delete User
              </Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <Alert className="border-orange-500 bg-orange-500/10">
              <Shield className="h-4 w-4 text-orange-500" />
              <AlertDescription className="text-orange-500">
                <strong>Second Confirmation:</strong> Please type the user's name to confirm deletion.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label htmlFor="confirmText" className="text-foreground">
                Type "{user?.name}" to confirm:
              </Label>
              <Input
                id="confirmText"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Enter user name"
                className="bg-background border-border text-foreground"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setConfirmationStep(1)}>
                Back
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => setConfirmationStep(3)}
                disabled={confirmText !== user?.name}
                className="flex items-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                Confirm Deletion
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <Alert className="border-red-500 bg-red-500/10">
              <UserX className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-500">
                <strong>Final Confirmation:</strong> Enter your admin password to permanently delete this user.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label htmlFor="adminPassword" className="text-foreground">
                Admin Password:
              </Label>
              <Input
                id="adminPassword"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter your admin password"
                className="bg-background border-border text-foreground"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setConfirmationStep(2)}>
                Back
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={!adminPassword || isLoading}
                className="flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Permanently Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-card border-border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-foreground">
            <Trash2 className="w-5 h-5 text-destructive" />
            <span>Delete User</span>
          </DialogTitle>
        </DialogHeader>

        {renderConfirmationStep()}
      </DialogContent>
    </Dialog>
  );
}; 