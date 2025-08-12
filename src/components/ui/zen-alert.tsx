import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ZenAlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  isOpen: boolean;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const ZenAlert: React.FC<ZenAlertProps> = ({
  type = 'info',
  title,
  message,
  isOpen,
  onClose,
  autoClose = true,
  duration = 5000,
  action
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      if (autoClose) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, autoClose, duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5" />;
      case 'error': return <AlertCircle className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'info': return <Info className="w-5 h-5" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success': return 'bg-success-soft border-success text-success-foreground';
      case 'error': return 'bg-destructive-soft border-destructive text-destructive-foreground';
      case 'warning': return 'bg-warning-soft border-warning text-warning-foreground';
      case 'info': return 'bg-primary-soft border-primary text-primary-foreground';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/20 backdrop-blur-sm">
      <div className={cn(
        "relative max-w-md w-full rounded-2xl border-2 shadow-floating transition-all duration-500 ease-zen",
        getColors(),
        isVisible ? "animate-scale-in opacity-100" : "opacity-0 scale-95"
      )}>
        {/* Ripple effect background */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-zen opacity-10 animate-gentle-pulse" />
        
        <div className="relative p-6">
          <div className="flex items-start space-x-4">
            <div className={cn(
              "flex-shrink-0 p-2 rounded-xl",
              type === 'success' && "bg-success/10",
              type === 'error' && "bg-destructive/10", 
              type === 'warning' && "bg-warning/10",
              type === 'info' && "bg-primary/10"
            )}>
              {getIcon()}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              <p className="text-sm opacity-80 leading-relaxed">{message}</p>
              
              {action && (
                <div className="mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={action.onClick}
                    className="bg-background/50 hover:bg-background/80 transition-zen"
                  >
                    {action.label}
                  </Button>
                </div>
              )}
            </div>

            <Button
              size="icon"
              variant="ghost"
              onClick={handleClose}
              className="flex-shrink-0 h-8 w-8 rounded-xl hover:bg-background/50 transition-zen"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Toast notification component
export interface ZenToastProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  message: string;
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
}

export const ZenToast: React.FC<ZenToastProps> = ({
  type = 'info',
  message,
  isOpen,
  onClose,
  duration = 3000
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'info': return <Info className="w-4 h-4" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success': return 'bg-success text-success-foreground border-success';
      case 'error': return 'bg-destructive text-destructive-foreground border-destructive';
      case 'warning': return 'bg-warning text-warning-foreground border-warning';
      case 'info': return 'bg-primary text-primary-foreground border-primary';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={cn(
        "flex items-center space-x-3 px-4 py-3 rounded-xl border shadow-peaceful backdrop-blur-sm transition-all duration-500 ease-zen",
        getColors(),
        isVisible ? "animate-slide-in opacity-100" : "opacity-0 translate-x-full"
      )}>
        {getIcon()}
        <span className="text-sm font-medium">{message}</span>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleClose}
          className="h-6 w-6 ml-2 hover:bg-background/20 transition-zen"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};