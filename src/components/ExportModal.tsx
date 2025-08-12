import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  FileText, 
  Calendar,
  Users,
  BarChart3,
  X,
  Check
} from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  users?: any[]; // Pass users from AdminDashboard
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  users = []
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [exportSettings, setExportSettings] = useState({
    format: 'pdf',
    dateRange: 'current_month',
    userId: 'all',
  });

  const handleExport = async () => {
    setIsLoading(true);
    try {
      if (exportSettings.format === 'pdf') {
        // Use current month for now
        const now = new Date();
        const startDate = format(startOfMonth(now), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(now), 'yyyy-MM-dd');
        const token = localStorage.getItem('authToken');
        let url = `http://localhost:5000/api/attendance/export/pdf?start_date=${startDate}&end_date=${endDate}`;
        if (exportSettings.userId !== 'all') {
          url += `&user_id=${exportSettings.userId}`;
        }
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error('Failed to export PDF');
        const blob = await response.blob();
        const pdfUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = pdfUrl;
        a.download = `attendance_export_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(pdfUrl);
        onClose();
      } else {
        // Simulate export for other formats
      await new Promise(resolve => setTimeout(resolve, 2000));
      const data = {
        format: exportSettings.format,
        dateRange: exportSettings.dateRange,
        timestamp: new Date().toISOString(),
          data: 'Sample export data',
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_export_${new Date().toISOString().split('T')[0]}.${exportSettings.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onClose();
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card border-border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-foreground">
            <Download className="w-5 h-5 text-primary" />
            <span>Export Data</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Format */}
          <div className="space-y-2">
            <Label className="text-foreground font-medium">Export Format</Label>
            <Select
              value={exportSettings.format}
              onValueChange={(value) => setExportSettings(prev => ({ ...prev, format: value }))}
            >
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                <SelectItem value="pdf">PDF Report</SelectItem>
                <SelectItem value="csv">CSV File (Simulated)</SelectItem>
                <SelectItem value="excel">Excel File (Simulated)</SelectItem>
                <SelectItem value="json">JSON Data (Simulated)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* User Selection */}
          <div className="space-y-2">
            <Label className="text-foreground font-medium">User</Label>
            <Select
              value={exportSettings.userId}
              onValueChange={(value) => setExportSettings(prev => ({ ...prev, userId: value }))}
            >
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                <SelectItem value="all">All Users</SelectItem>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>{user.name} ({user.email})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isLoading} className="bg-background border-border text-foreground hover:bg-accent">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={isLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Download className="w-4 h-4 mr-2" />
              {isLoading ? 'Exporting...' : 'Export Data'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 