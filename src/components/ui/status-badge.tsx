import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-all",
  {
    variants: {
      status: {
        present: "bg-success/10 text-success border border-success/20",
        absent: "bg-destructive/10 text-destructive border border-destructive/20",
        late: "bg-warning/10 text-warning border border-warning/20",
        "half-day": "bg-primary/10 text-primary border border-primary/20"
      }
    },
    defaultVariants: {
      status: "present"
    }
  }
);

interface StatusBadgeProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  status: 'present' | 'absent' | 'late' | 'half-day';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  className, 
  ...props 
}) => {
  const getStatusText = (status: string) => {
    switch (status) {
      case 'present': return 'Present';
      case 'absent': return 'Absent';
      case 'late': return 'Late';
      case 'half-day': return 'Half Day';
      default: return status;
    }
  };

  return (
    <div 
      className={cn(statusBadgeVariants({ status }), className)} 
      {...props}
    >
      <div className={cn(
        "w-2 h-2 rounded-full mr-2",
        status === 'present' && "bg-success",
        status === 'absent' && "bg-destructive", 
        status === 'late' && "bg-warning",
        status === 'half-day' && "bg-primary"
      )} />
      {getStatusText(status)}
    </div>
  );
};